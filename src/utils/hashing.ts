import { Lane, LogicalLane, LaneBoundary, LogicalLaneBoundary } from "@lichtblick/asam-osi-types";

type EntityWithIdentifier = {
  id?: {
    value?: number;
  };
};

const createIdCacheKey = <T extends EntityWithIdentifier>(entities: T[]): string => {
  const ids = entities.map((entity) => entity.id?.value?.toString() ?? "undefined");
  return `${ids.length}|${ids.join(":")}`;
};

/**
 * Hashing function to create a unique hash for lane objects.
 *
 * The hashLanes function creates an unambiguous cache key by:
 *
 * - Using all lane IDs in their original order.
 * - Joining them with separators and the count to avoid concatenation collisions.
 *
 * Note: This mechanism is a temporary solution to demonstrate the feasibility of caching as it relies on the assumption that a lane with the same id will always have the same properties.
 * This might not be the case when using partial chunking of lanes/lane boundaries.
 */
export const hashLanes = (lanes: Lane[] | LogicalLane[]): string => {
  return createIdCacheKey(lanes);
};

/**
 * Hashing function to create a unique hash for lane boundary objects.
 *
 * The hashLaneBoundaries function creates an unambiguous cache key by:
 *
 * - Using all boundary IDs in their original order.
 * - Joining them with separators and the count to avoid concatenation collisions.
 *
 * Note: This mechanism is a temporary solution to demonstrate the feasibility of caching as it relies on the assumption that a lane with the same id will always have the same properties.
 * This might not be the case when using partial chunking of lanes/lane boundaries.
 */
export const hashLaneBoundaries = (
  laneBoundaries: LaneBoundary[] | LogicalLaneBoundary[],
): string => {
  return createIdCacheKey(laneBoundaries);
};
