import { IReadable, McapIndexedReader, McapTypes } from "@mcap/core";
import { FileHandle, open } from "fs/promises";
import { decompress } from "fzstd";
import protobuf from "protobufjs";
import "protobufjs/ext/descriptor";

class FileReadable implements IReadable {
  public constructor(private readonly handle: FileHandle) {}

  public async size(): Promise<bigint> {
    return BigInt((await this.handle.stat()).size);
  }

  public async read(offset: bigint, size: bigint): Promise<Uint8Array> {
    const buffer = new Uint8Array(Number(size));
    await this.handle.read(buffer, 0, buffer.length, Number(offset));
    return buffer;
  }
}

const decompressHandlers = {
  zstd: (data: Uint8Array, size: bigint) => decompress(data, new Uint8Array(Number(size))),
};

export interface ProtobufMcapMessage {
  topic: string;
  schema: McapTypes.Schema;
  channel: McapTypes.Channel;
  record: McapTypes.Message;
  type: protobuf.Type;
  /** Decoded message as a plain object with the original (snake_case) proto field names. */
  object: Record<string, unknown>;
}

/** Reads and decodes protobuf messages of an MCAP file using the embedded descriptor sets. */
export async function readProtobufMessages(
  file: string,
  limit = Number.POSITIVE_INFINITY,
): Promise<ProtobufMcapMessage[]> {
  const handle = await open(file, "r");
  try {
    const reader = await McapIndexedReader.Initialize({
      readable: new FileReadable(handle),
      decompressHandlers,
    });
    const types = new Map<number, protobuf.Type>();
    const result: ProtobufMcapMessage[] = [];
    for await (const record of reader.readMessages()) {
      if (result.length >= limit) {
        break;
      }
      const channel = reader.channelsById.get(record.channelId)!;
      const schema = reader.schemasById.get(channel.schemaId)!;
      if (schema.encoding !== "protobuf") {
        continue;
      }
      let type = types.get(schema.id);
      if (!type) {
        type = protobuf.Root.fromDescriptor(schema.data, { keepCase: true }).lookupType(
          schema.name,
        );
        types.set(schema.id, type);
      }
      const object = type.toObject(type.decode(record.data), {
        longs: Number,
        enums: Number,
        defaults: true,
      });
      result.push({ topic: channel.topic, schema, channel, record, type, object });
    }
    return result;
  } finally {
    await handle.close();
  }
}

/** Returns the global ground truth of an OSI GroundTruth or SensorView message. */
export function groundTruthOf(message: ProtobufMcapMessage): Record<string, any> | undefined {
  switch (message.schema.name) {
    case "osi3.GroundTruth":
      return message.object;
    case "osi3.SensorView":
      return (message.object.global_ground_truth as Record<string, any> | null) ?? undefined;
    default:
      return undefined;
  }
}
