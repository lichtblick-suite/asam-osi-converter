import { createLaneCacheKey, createRenderedPhysicalLaneCacheKey } from "@utils/cacheKeys";

describe("Cache key utilities", () => {
  it("creates different lane keys for ambiguous concatenation cases", () => {
    const lanesA = [{ id: { value: 1 } }, { id: { value: 23 } }];
    const lanesB = [{ id: { value: 12 } }, { id: { value: 3 } }];

    expect(createLaneCacheKey(lanesA as any)).not.toBe(createLaneCacheKey(lanesB as any));
  });

  it("changes rendered physical lane key when host-lane flag changes", () => {
    const nonHostLane = [{ id: { value: 5 }, classification: { is_host_vehicle_lane: false } }];
    const hostLane = [{ id: { value: 5 }, classification: { is_host_vehicle_lane: true } }];

    expect(createRenderedPhysicalLaneCacheKey(nonHostLane as any)).not.toBe(
      createRenderedPhysicalLaneCacheKey(hostLane as any),
    );
  });
});
