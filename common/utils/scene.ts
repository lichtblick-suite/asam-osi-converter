import type { SceneEntity, SceneEntityDeletion } from "@foxglove/schemas";
import { SceneEntityDeletionType } from "@foxglove/schemas";
import type { Time } from "@foxglove/schemas/schemas/typescript/Time";
import type { DeepPartial } from "ts-essentials";

export type PartialSceneEntity = DeepPartial<SceneEntity> & { id: string };

export function buildSceneEntityDeletions(time: Time = { sec: 0, nsec: 0 }): SceneEntityDeletion[] {
  return [
    {
      id: "",
      timestamp: time,
      type: SceneEntityDeletionType.ALL,
    },
  ];
}

/**
 * Generates a unique scene entity ID by combining a predefined object-type-specific prefix
 * with the given numeric ID.
 *
 * This function, together with the predefined object-type-specific prefixes,
 * must be used when creating scene entity IDs to ensure consistency and uniqueness
 * across different entity types.
 *
 * @param prefix - The object-type-specific prefix to prepend to the ID.
 * @param id - The numeric ID of the entity.
 * @returns A string representing the unique scene entity ID.
 */
export function generateSceneEntityId(prefix: string, id: number): string {
  return `${prefix}_${id.toString()}`;
}
