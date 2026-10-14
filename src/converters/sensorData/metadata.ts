import { KeyValuePair } from "@foxglove/schemas";
import {
  DetectedItemHeader_MeasurementState,
  DetectedMovingObject,
} from "@lichtblick/asam-osi-types";

/** Builds the basic information shown when a detected moving object is inspected. */
export function buildDetectedMovingObjectMetadata(
  object: DetectedMovingObject,
): KeyValuePair[] {
  const metadata: KeyValuePair[] = [];
  const header = object.header;
  const base = object.base;

  if (header?.tracking_id?.value != undefined) {
    metadata.push({ key: "tracking_id", value: String(header.tracking_id.value) });
  }
  if (header?.ground_truth_id?.length) {
    metadata.push({
      key: "ground_truth_id",
      value: header.ground_truth_id.map((id) => String(id.value)).join(", "),
    });
  }
  if (header?.existence_probability != undefined) {
    metadata.push({
      key: "existence_probability",
      value: String(header.existence_probability),
    });
  }
  if (header?.age != undefined) {
    metadata.push({ key: "age", value: `${String(header.age)} s` });
  }
  if (header?.measurement_state != undefined) {
    metadata.push({
      key: "measurement_state",
      value:
        DetectedItemHeader_MeasurementState[header.measurement_state] ??
        String(header.measurement_state),
    });
  }
  if (base?.position != undefined) {
    metadata.push({
      key: "position",
      value: `${String(base.position.x)}, ${String(base.position.y)}, ${String(base.position.z)}`,
    });
  }
  if (base?.dimension != undefined) {
    metadata.push({
      key: "dimensions",
      value: `${String(base.dimension.length)}, ${String(base.dimension.width)}, ${String(base.dimension.height)}`,
    });
  }

  return metadata;
}
