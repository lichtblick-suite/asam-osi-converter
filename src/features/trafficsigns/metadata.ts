import { KeyValuePair } from "@foxglove/schemas";
import {
  TrafficSign,
  TrafficSign_MainSign_Classification_Type,
  TrafficSignValue_Unit,
} from "@lichtblick/asam-osi-types";

export function buildTrafficSignMetadata(obj: TrafficSign): KeyValuePair[] {
  // mandatory metadata
  const metadata: KeyValuePair[] = [];

  // optional metadata content
  if (obj.main_sign?.classification?.type != null) {
    metadata.push({
      key: "type",
      value: TrafficSign_MainSign_Classification_Type[obj.main_sign.classification.type],
    });
  }
  if (obj.main_sign?.classification?.value) {
    metadata.push({
      key: "value",
      value: `${obj.main_sign.classification.value.value.toString()} ${TrafficSignValue_Unit[obj.main_sign.classification.value.value_unit]} ${obj.main_sign.classification.value.text}`,
    });
  }
  if (obj.main_sign?.classification?.code) {
    metadata.push({
      key: "code",
      value: obj.main_sign.classification.code,
    });
  }

  return metadata;
}
