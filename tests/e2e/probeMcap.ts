import { SceneUpdate as SceneUpdateJsonSchema } from "@foxglove/schemas/jsonschema";
import { IWritable, McapWriter } from "@mcap/core";
import { writeFile } from "fs/promises";

import { groundTruthOf, readProtobufMessages } from "../helpers/mcap";
import {
  matrixToQuaternion,
  predictRoadMarkingBoxes,
  PROBE_MARKINGS,
} from "../helpers/osiGeometry";

export const PROBE_SCENE_TOPIC = "/probe/scene";

class BufferWritable implements IWritable {
  readonly #chunks: Uint8Array[] = [];
  #length = BigInt(0);

  public position(): bigint {
    return this.#length;
  }

  public async write(buffer: Uint8Array): Promise<void> {
    this.#chunks.push(buffer.slice());
    this.#length += BigInt(buffer.byteLength);
  }

  public bytes(): Buffer {
    return Buffer.concat(this.#chunks);
  }
}

/** The probe markings drawn directly as foxglove.SceneUpdate cubes from the reference model. */
function probeSceneUpdate(logTime: bigint) {
  const billion = BigInt(1_000_000_000);
  const timestamp = { sec: Number(logTime / billion), nsec: Number(logTime % billion) };
  return {
    deletions: [],
    entities: PROBE_MARKINGS.map((marking) => ({
      timestamp,
      frame_id: "global",
      id: `probe_${marking.name}`,
      lifetime: { sec: 0, nsec: 0 },
      frame_locked: true,
      metadata: [],
      cubes: predictRoadMarkingBoxes(marking).map(({ center, rotation, size }) => ({
        pose: {
          position: { x: center[0], y: center[1], z: center[2] },
          orientation: matrixToQuaternion(rotation),
        },
        size: { x: size[0], y: size[1], z: size[2] },
        color: { r: marking.rgb[0], g: marking.rgb[1], b: marking.rgb[2], a: 1 },
      })),
      arrows: [],
      spheres: [],
      cylinders: [],
      lines: [],
      triangles: [],
      texts: [],
      models: [],
    })),
  };
}

/**
 * Copies the OSI messages of `source` to `target`, replacing all road markings with
 * PROBE_MARKINGS, and adds the same markings as an independently computed SceneUpdate topic.
 * Returns the OSI topic names.
 */
export async function writeProbeMcap(source: string, target: string): Promise<string[]> {
  const writable = new BufferWritable();
  const writer = new McapWriter({ writable });
  await writer.start({ profile: "", library: "asam-osi-converter road marking probe" });
  const sceneChannel = await writer.registerChannel({
    topic: PROBE_SCENE_TOPIC,
    messageEncoding: "json",
    metadata: new Map(),
    schemaId: await writer.registerSchema({
      name: "foxglove.SceneUpdate",
      encoding: "jsonschema",
      data: new TextEncoder().encode(JSON.stringify(SceneUpdateJsonSchema)),
    }),
  });

  const schemaIds = new Map<number, number>();
  const channelIds = new Map<number, number>();
  const topics = new Set<string>();
  for (const message of await readProtobufMessages(source)) {
    if (!groundTruthOf(message)) {
      continue;
    }
    const { schema, channel, record, type } = message;
    if (!schemaIds.has(schema.id)) {
      const { name, encoding, data } = schema;
      schemaIds.set(schema.id, await writer.registerSchema({ name, encoding, data }));
    }
    if (!channelIds.has(channel.id)) {
      const { topic, messageEncoding, metadata } = channel;
      const schemaId = schemaIds.get(schema.id)!;
      channelIds.set(
        channel.id,
        await writer.registerChannel({ topic, messageEncoding, metadata, schemaId }),
      );
      topics.add(topic);
    }

    // Re-decode without defaults, so the re-encoded message only differs in its road markings
    const object = type.toObject(type.decode(record.data)) as Record<string, any>;
    const groundTruth = schema.name === "osi3.SensorView" ? object.global_ground_truth : object;
    groundTruth.road_marking = PROBE_MARKINGS.map(({ id, base, classification }) => ({
      id,
      base,
      classification,
    }));
    const { sequence, logTime, publishTime } = record;
    await writer.addMessage({
      channelId: channelIds.get(channel.id)!,
      sequence,
      logTime,
      publishTime,
      data: type.encode(type.fromObject(object)).finish(),
    });
    await writer.addMessage({
      channelId: sceneChannel,
      sequence,
      logTime,
      publishTime: logTime,
      data: new TextEncoder().encode(JSON.stringify(probeSceneUpdate(logTime))),
    });
  }
  await writer.end();
  await writeFile(target, writable.bytes());
  return [...topics];
}
