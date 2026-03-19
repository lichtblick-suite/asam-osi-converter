import { Lane, LogicalLane, LaneBoundary, LogicalLaneBoundary } from "@lichtblick/asam-osi-types";

// --- FNV-1a hash primitives ---

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** Number of evenly-spaced points sampled per boundary/centerline for geometry fingerprinting. */
const GEOMETRY_SAMPLE_COUNT = 8;

/** Coordinate quantization scale (millimeter precision). */
const COORD_SCALE = 1000;

function fnvMix(h: number, value: number): number {
  return Math.imul(h ^ (value & 0xffffffff), FNV_PRIME);
}

function fnvCoord(h: number, coord: number | undefined): number {
  return fnvMix(h, Math.round((coord ?? 0) * COORD_SCALE));
}

/**
 * Returns evenly-spaced sample indices (always includes first and last).
 * For arrays with length <= maxSamples, returns all indices.
 */
function sampleIndices(length: number, maxSamples: number): number[] {
  if (length === 0) {
    return [];
  }
  if (length <= maxSamples) {
    return Array.from({ length }, (_, i) => i);
  }
  const indices: number[] = [];
  for (let i = 0; i < maxSamples; i++) {
    indices.push(Math.round((i * (length - 1)) / (maxSamples - 1)));
  }
  return indices;
}

/** Combines sorted per-entity (id, signature) pairs into a single collection hash. */
function collectionHash(entries: [number, number][]): string {
  entries.sort((a, b) => a[0] - b[0]);
  let h = FNV_OFFSET;
  for (const [id, sig] of entries) {
    h = fnvMix(h, id);
    h = fnvMix(h, sig);
  }
  return h.toString();
}

// --- Boundary hashing ---

export interface BoundaryHashResult {
  /** Collection-level hash string for cache lookup. */
  hash: string;
  /** Per-boundary signatures (id → signature) for WL propagation into lane hashes. */
  signatures: Map<number, number>;
}

/**
 * Computes geometry-aware signatures for lane boundaries and a collection hash.
 * Works with both physical {@link LaneBoundary} and logical {@link LogicalLaneBoundary} types.
 *
 * Each boundary signature incorporates:
 * - Entity ID and point count
 * - Sampled boundary point positions (quantized to mm precision)
 * - Classification type and color (physical boundaries only)
 *
 * The collection hash is order-independent (sorted by ID).
 */
export function hashBoundaries(
  boundaries: (LaneBoundary | LogicalLaneBoundary)[],
): BoundaryHashResult {
  const signatures = new Map<number, number>();

  for (const boundary of boundaries) {
    const id = boundary.id?.value ?? 0;
    let h = FNV_OFFSET;
    h = fnvMix(h, id);

    // Physical boundary classification (LogicalLaneBoundary lacks this field)
    const cls = (boundary as LaneBoundary).classification;
    if (cls != null) {
      h = fnvMix(h, cls.type ?? 0);
      h = fnvMix(h, cls.color ?? 0);
    }

    // Geometry: sampled boundary points
    const points = boundary.boundary_line ?? [];
    h = fnvMix(h, points.length);

    for (const idx of sampleIndices(points.length, GEOMETRY_SAMPLE_COUNT)) {
      const pt = points[idx]!;
      h = fnvCoord(h, pt.position?.x);
      h = fnvCoord(h, pt.position?.y);
      h = fnvCoord(h, pt.position?.z);
    }

    signatures.set(id, h);
  }

  return {
    hash: collectionHash([...signatures.entries()]),
    signatures,
  };
}

// --- Lane hashing (Weisfeiler-Lehman inspired) ---

/**
 * Computes a geometry-aware collection hash for physical lanes.
 *
 * Uses a Weisfeiler-Lehman inspired approach: each lane's signature incorporates
 * its own geometry (centerline sampling) plus the signatures of its referenced
 * left/right lane boundaries. This ensures that boundary geometry changes
 * propagate into the lane hash, preventing stale cache hits when boundaries
 * change but lane IDs remain the same.
 *
 * @param lanes - Physical lane objects from the OSI message.
 * @param boundarySignatures - Per-boundary signatures from {@link hashBoundaries},
 *   used for WL neighborhood aggregation.
 */
export function hashLanes(lanes: Lane[], boundarySignatures: Map<number, number>): string {
  const entries: [number, number][] = [];

  for (const lane of lanes) {
    const id = lane.id?.value ?? 0;
    let h = FNV_OFFSET;
    h = fnvMix(h, id);

    const cls = lane.classification;
    h = fnvMix(h, cls?.type ?? 0);
    h = fnvMix(h, cls?.is_host_vehicle_lane === true ? 1 : 0);
    h = fnvMix(h, cls?.centerline_is_driving_direction === true ? 1 : 0);

    // Centerline geometry sampling
    const centerline = cls?.centerline ?? [];
    h = fnvMix(h, centerline.length);
    for (const idx of sampleIndices(centerline.length, GEOMETRY_SAMPLE_COUNT)) {
      const pt = centerline[idx]!;
      h = fnvCoord(h, pt.x);
      h = fnvCoord(h, pt.y);
      h = fnvCoord(h, pt.z);
    }

    // WL: incorporate left boundary signatures
    const leftIds = (cls?.left_lane_boundary_id ?? [])
      .map((bid) => bid.value ?? 0)
      .sort((a, b) => a - b);
    for (const bid of leftIds) {
      h = fnvMix(h, boundarySignatures.get(bid) ?? 0);
    }

    // WL: incorporate right boundary signatures
    const rightIds = (cls?.right_lane_boundary_id ?? [])
      .map((bid) => bid.value ?? 0)
      .sort((a, b) => a - b);
    for (const bid of rightIds) {
      h = fnvMix(h, boundarySignatures.get(bid) ?? 0);
    }

    entries.push([id, h]);
  }

  return collectionHash(entries);
}

/**
 * Computes a geometry-aware collection hash for logical lanes.
 *
 * WL-inspired: each logical lane's signature incorporates the signatures
 * of its referenced left/right logical lane boundaries.
 *
 * @param lanes - Logical lane objects from the OSI message.
 * @param boundarySignatures - Per-boundary signatures from {@link hashBoundaries},
 *   used for WL neighborhood aggregation.
 */
export function hashLogicalLanes(
  lanes: LogicalLane[],
  boundarySignatures: Map<number, number>,
): string {
  const entries: [number, number][] = [];

  for (const lane of lanes) {
    const id = lane.id?.value ?? 0;
    let h = FNV_OFFSET;
    h = fnvMix(h, id);
    h = fnvMix(h, lane.type ?? 0);

    // WL: incorporate left boundary signatures
    const leftIds = (lane.left_boundary_id ?? [])
      .map((bid) => bid.value ?? 0)
      .sort((a, b) => a - b);
    for (const bid of leftIds) {
      h = fnvMix(h, boundarySignatures.get(bid) ?? 0);
    }

    // WL: incorporate right boundary signatures
    const rightIds = (lane.right_boundary_id ?? [])
      .map((bid) => bid.value ?? 0)
      .sort((a, b) => a - b);
    for (const bid of rightIds) {
      h = fnvMix(h, boundarySignatures.get(bid) ?? 0);
    }

    entries.push([id, h]);
  }

  return collectionHash(entries);
}
