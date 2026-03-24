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
 * Creates an unambiguous cache key for lanes by:
 *
 * - Using all lane IDs in their original order.
 * - Joining them with separators and the count to avoid concatenation collisions.
 *
 * Note: This mechanism is a temporary solution to demonstrate the feasibility
 * of caching as it relies on the assumption that a lane with the same id will
 * always have the same properties.
 */
export const createLaneCacheKey = (lanes: Lane[] | LogicalLane[]): string => {
  return createIdCacheKey(lanes);
};

/**
 * Hashing function to create a cache key for rendered physical lanes.
 *
 * In addition to lane IDs, this includes `is_host_vehicle_lane`, because that
 * flag affects lane rendering color and may change at runtime.
 */
export const createRenderedPhysicalLaneCacheKey = (lanes: Lane[]): string => {
  const laneKeys = lanes.map((lane) => {
    const id = lane.id?.value?.toString() ?? "undefined";
    const isHostVehicleLane = lane.classification?.is_host_vehicle_lane;
    const hostFlag =
      isHostVehicleLane === undefined ? "u" : isHostVehicleLane ? "1" : "0";
    return `${id}@${hostFlag}`;
  });
  return `${laneKeys.length}|${laneKeys.join(":")}`;
};

/**
 * Creates an unambiguous cache key for lane boundaries by:
 *
 * - Using all boundary IDs in their original order.
 * - Joining them with separators and the count to avoid concatenation collisions.
 */
export const createLaneBoundaryCacheKey = (
  laneBoundaries: LaneBoundary[] | LogicalLaneBoundary[],
): string => {
  return createIdCacheKey(laneBoundaries);
};
