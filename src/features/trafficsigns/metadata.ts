import { KeyValuePair } from "@foxglove/schemas";
import {
  TrafficSign,
  TrafficSign_MainSign_Classification_Type,
  TrafficSignValue_Unit,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

export function buildTrafficSignMetadata(obj: DeepRequired<TrafficSign>): KeyValuePair[] {
  // mandatory metadata
  const metadata: KeyValuePair[] = [];

  // optional metadata content
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (obj.main_sign?.classification?.type != null) {
    metadata.push({
      key: "type",
      value: TrafficSign_MainSign_Classification_Type[obj.main_sign.classification.type],
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (obj.main_sign?.classification?.value != null) {
    metadata.push({
      key: "value",
      value: `${obj.main_sign.classification.value.value} ${TrafficSignValue_Unit[obj.main_sign.classification.value.value_unit]} ${obj.main_sign.classification.value.text}`,
    });
  }
  if (obj.main_sign.classification.code) {
    metadata.push({
      key: "code",
      value: obj.main_sign.classification.code,
    });
  }

  return metadata;
}
