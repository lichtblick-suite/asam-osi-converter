import { Lane, LogicalLane, LaneBoundary, LogicalLaneBoundary } from "@lichtblick/asam-osi-types";

/**
 * Hashing function to create a unique hash for lane objects.
 *
 * The hashLanes function creates a hash by:
 *
 * - Concatenating the id values of all Lane objects.
 * - Iterating over the concatenated string and updating a hash value using bitwise operations.
 *
 * Note: This mechanism is a temporary solution to demonstrate the feasibility of caching as it relies on the assumption that a lane with the same id will always have the same properties.
 * This might not be the case when using partial chunking of lanes/lane boundaries.
 */
export const hashLanes = (lanes: Lane[] | LogicalLane[]): string => {
  const hash = lanes.reduce((acc, lane) => acc + lane.id!.value.toString(), "");
  let hashValue = 0;
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + char;
    hashValue |= 0; // Convert to 32bit integer
  }
  return hashValue.toString();
};

/**
 * Hashing function to create a unique hash for lane boundary objects.
 *
 * The hashLanes function creates a hash by:
 *
 * - Concatenating the id values of all LaneBoundary objects.
 * - Iterating over the concatenated string and updating a hash value using bitwise operations.
 *
 * Note: This mechanism is a temporary solution to demonstrate the feasibility of caching as it relies on the assumption that a lane with the same id will always have the same properties.
 * This might not be the case when using partial chunking of lanes/lane boundaries.
 */
export const hashLaneBoundaries = (
  laneBoundaries: LaneBoundary[] | LogicalLaneBoundary[],
): string => {
  const hash = laneBoundaries.reduce(
    (acc, laneBoundary) => acc + laneBoundary.id!.value.toString(),
    "",
  );
  let hashValue = 0;
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + char;
    hashValue |= 0; // Convert to 32bit integer
  }
  return hashValue.toString();
};
