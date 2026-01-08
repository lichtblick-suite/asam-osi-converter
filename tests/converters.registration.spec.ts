import {
  GroundTruth,
  Lane,
  Lane_Classification_Type,
  LaneBoundary,
  LaneBoundary_Classification_Color,
  LaneBoundary_Classification_Type,
  MovingObject,
  MovingObject_Type,
  MovingObject_VehicleClassification_Type,
  StationaryObject,
} from "@lichtblick/asam-osi-types";
import { ExtensionContext } from "@lichtblick/suite";

import { activate } from "@/index";

jest.mock("@features/trafficsigns", () => ({
  preloadDynamicTextures: jest.fn(),
}));

jest.mock("@features/trafficlights", () => ({}));

describe("OSI Visualizer: Message Converter", () => {
  const mockRegisterMessageConverter = jest.fn();
  const mockExtensionContext = {} as ExtensionContext;
  const mockBase = {
    dimension: {
      width: 1,
      height: 1,
      length: 1,
    },
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    orientation: {
      yaw: 0,
      pitch: 0,
      roll: 0,
    },
  };
  const mockBaseMoving = {
    dimension: {
      width: 1,
      height: 1,
      length: 1,
    },
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    acceleration: {
      x: 20,
      y: 20,
      z: 0,
    },
    velocity: {
      x: 30,
      y: 40,
      z: 0,
    },
    orientation: {
      yaw: 0,
      pitch: 0,
      roll: 0,
    },
  };
  const mockMovingObject = {
    id: {
      value: 0,
    },
    base: mockBaseMoving,
    type: {
      value: MovingObject_Type.TYPE_VEHICLE,
    },
    model_reference: "",
    vehicle_attributes: {
      bbcenter_to_rear: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    moving_object_classification: {
      assigned_lane_id: [99, 100],
    },
    vehicle_classification: {
      type: {
        value: MovingObject_VehicleClassification_Type.TYPE_SMALL_CAR,
      },
      light_state: {},
    },
  } as unknown as MovingObject;
  const mockStationaryObject = {
    id: {
      value: 1,
    },
    base: mockBase,
    classification: {
      color: 0,
      type: 0,
      material: 0,
      density: 0,
    },
  } as unknown as StationaryObject;
  const mockLaneBoundary = {
    id: {
      value: 2,
    },
    boundary_line: [
      {
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        width: 1,
        height: 0,
      },
    ],
    classification: {
      type: {
        value: LaneBoundary_Classification_Type.TYPE_NO_LINE,
      },
      color: LaneBoundary_Classification_Color.COLOR_WHITE,
    },
  } as unknown as LaneBoundary;
  const mockLane = {
    id: {
      value: 1000,
    },
    classification: {
      type: {
        value: Lane_Classification_Type.TYPE_DRIVING,
      },
      left_lane_boundary_id: [
        {
          value: 2,
        },
      ],
      right_lane_boundary_id: [
        {
          value: 999,
        },
      ],
      lane_pairing: [
        {
          antecessor_lane_id: {
            value: 999,
          },
          successor_lane_id: {
            value: 999,
          },
        },
      ],
      left_adjacent_lane_id: [
        {
          value: 999,
        },
      ],
      right_adjacent_lane_id: [
        {
          value: 999,
        },
      ],
      centerline: [],
    },
  } as unknown as Lane;
  const mockMessageData = {
    timestamp: {
      seconds: 0,
      nanos: 0,
    },
    host_vehicle_id: {
      value: 0,
    },
    moving_object: [mockMovingObject],
    stationary_object: [mockStationaryObject],
    lane_boundary: [mockLaneBoundary],
    lane: [mockLane],
    logical_lane: [],
    logical_lane_boundary: [],
    traffic_sign: [],
    traffic_light: [],
    road_marking: [],
  } as unknown as GroundTruth;

  beforeEach(() => {
    mockExtensionContext.registerMessageConverter = mockRegisterMessageConverter;
    mockRegisterMessageConverter.mockClear();
  });

  it("registers the message converters", () => {
    activate(mockExtensionContext);
    expect(mockRegisterMessageConverter).toHaveBeenCalledTimes(6);
  });

  it("converts a simple message { fromSchemaName: osi_3_msgs/osi_GroundTruth toSchemaName: foxglove.SceneUpdate }", () => {
    activate(mockExtensionContext);
    const messageConverterArgs = mockRegisterMessageConverter.mock.calls[0][0] as {
      converter: (data: GroundTruth) => any;
    };
    const result = messageConverterArgs.converter(mockMessageData);
    expect(result.deletions).toBeDefined();
    expect(result.entities).toBeDefined();
  });
});
