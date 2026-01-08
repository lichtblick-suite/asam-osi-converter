import { KeyValuePair } from "@foxglove/schemas";
import {
  TrafficLight,
  TrafficLight_Classification_Color,
  TrafficLight_Classification_Icon,
  TrafficLight_Classification_Mode,
} from "@lichtblick/asam-osi-types";

export function buildTrafficLightMetadata(obj: TrafficLight): KeyValuePair[] {
  const metadata: KeyValuePair[] = [];
  if (obj.classification) {
    metadata.push(
      {
        key: "color",
        value: TrafficLight_Classification_Color[obj.classification.color],
      },
      {
        key: "icon",
        value: TrafficLight_Classification_Icon[obj.classification.icon],
      },
      {
        key: "mode",
        value: TrafficLight_Classification_Mode[obj.classification.mode],
      },
    );
  }

  return metadata;
}
