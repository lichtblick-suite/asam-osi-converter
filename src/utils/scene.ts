import { SceneEntityDeletionType } from "@foxglove/schemas";
import type { SceneEntity, SceneEntityDeletion, Time } from "@foxglove/schemas";
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

/**
 * Identifies and returns entities that have been deleted between frames based on their IDs.
 * Updates the set of IDs from the current frame for future comparisons.
 *
 * @template T - The type of the entities, which must include an `id` property with a `value` of type `number`.
 *
 * @param osiEntities - The array of entities from the current frame, with all properties deeply required.
 * @param previousFrameIds - A set of IDs from the previous frame to compare against.
 * @param entityPrefix - A string prefix to prepend to the deleted entity IDs in the result.
 * @param timestamp - The timestamp to associate with the deleted entities.
 *
 * @returns An array of partial scene entities representing the deleted entities,
 *          each containing an ID, timestamp, and deletion type.
 */
export function getDeletedEntities(
  osiEntities: { id?: { value: number } }[],
  previousFrameIds: Set<number>,
  entityPrefix: string,
  timestamp: Time,
): PartialSceneEntity[] {
  const currentIds = new Set(osiEntities.map((entity) => entity.id!.value));
  const deletedIds = Array.from(previousFrameIds).filter((id) => !currentIds.has(id));
  previousFrameIds.clear();
  currentIds.forEach((id) => previousFrameIds.add(id));
  return deletedIds.map((id) => ({
    id: generateSceneEntityId(entityPrefix, id),
    timestamp,
    type: SceneEntityDeletionType.MATCHING_ID,
  }));
}
