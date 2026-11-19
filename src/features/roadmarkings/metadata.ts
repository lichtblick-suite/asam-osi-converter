import { KeyValuePair } from "@foxglove/schemas";
import {
  RoadMarking,
  RoadMarking_Classification_Type,
  RoadMarking_Classification_Color,
  TrafficSign_MainSign_Classification_Type,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

export function buildRoadMarkingMetadata(road_marking: DeepRequired<RoadMarking>): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "type",
      value: RoadMarking_Classification_Type[road_marking.classification.type],
    },
    {
      key: "traffic_main_sign_type",
      value:
        TrafficSign_MainSign_Classification_Type[
          road_marking.classification.traffic_main_sign_type
        ],
    },
    {
      key: "color",
      value: RoadMarking_Classification_Color[road_marking.classification.monochrome_color],
    },
    {
      key: "width",
      value: road_marking.base.dimension.width.toString(),
    },
    {
      key: "height",
      value: road_marking.base.dimension.height.toString(),
    },
  ];

  return metadata;
}
