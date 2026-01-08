import { KeyValuePair } from "@foxglove/schemas";
import {
  RoadMarking,
  RoadMarking_Classification_Type,
  RoadMarking_Classification_Color,
} from "@lichtblick/asam-osi-types";

export function buildRoadMarkingMetadata(road_marking: RoadMarking): KeyValuePair[] {
  const metadata: KeyValuePair[] = [];

  if (road_marking.classification && road_marking.base?.dimension) {
    metadata.push(
      {
        key: "type",
        value: RoadMarking_Classification_Type[road_marking.classification.type],
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
    );
  }

  return metadata;
}
