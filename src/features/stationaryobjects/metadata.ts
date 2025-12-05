import { KeyValuePair } from "@foxglove/schemas";
import { StationaryObject } from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

import {
  STATIONARY_OBJECT_DENSITY,
  STATIONARY_OBJECT_MATERIAL,
  STATIONARY_OBJECT_COLOR,
  STATIONARY_OBJECT_TYPE,
} from "@/config/constants";

export function buildStationaryMetadata(obj: DeepRequired<StationaryObject>): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "density",
      value: STATIONARY_OBJECT_DENSITY[obj.classification.density] || STATIONARY_OBJECT_DENSITY[0],
    },
    {
      key: "material",
      value:
        STATIONARY_OBJECT_MATERIAL[obj.classification.material] || STATIONARY_OBJECT_MATERIAL[0],
    },
    {
      key: "color",
      value:
        STATIONARY_OBJECT_COLOR[obj.classification.color].name || STATIONARY_OBJECT_COLOR[0].name,
    },
    {
      key: "type",
      value: STATIONARY_OBJECT_TYPE[obj.classification.type] || STATIONARY_OBJECT_TYPE[0],
    },
  ];

  return metadata;
}
