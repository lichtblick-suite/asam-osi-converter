import { KeyValuePair, SceneEntity, SceneUpdate } from "@foxglove/schemas";
import {
  GroundTruth,
  Lane,
  Lane_Classification_Type,
  LaneBoundary,
  LaneBoundary_BoundaryPoint,
  LaneBoundary_Classification_Color,
  LaneBoundary_Classification_Type,
  MovingObject,
  MovingObject_Type,
  MovingObject_VehicleClassification,
  MovingObject_VehicleClassification_LightState_BrakeLightState,
  MovingObject_VehicleClassification_LightState_GenericLightState,
  MovingObject_VehicleClassification_LightState_IndicatorState,
  MovingObject_VehicleClassification_Type,
  StationaryObject,
} from "@lichtblick/asam-osi-types";
import { ExtensionContext } from "@lichtblick/suite";
import { DeepRequired } from "ts-essentials";

import { activate, buildVehicleMetadata } from "../index";
import { buildLaneBoundaryMetadata } from "../lanes";

jest.mock(
  "../trafficsigns",
  () => ({
    preloadDynamicTextures: () => {},
  }),
  { virtual: true },
);

jest.mock("../trafficlights", () => {}, { virtual: true });

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
      value: MovingObject_Type.VEHICLE,
    },
    assigned_lane_id: [99, 100],
    model_reference: "",
    vehicle_attributes: {
      bbcenter_to_rear: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    vehicle_classification: {
      type: {
        value: MovingObject_VehicleClassification_Type.SMALL_CAR,
      },
      light_state: {},
    },
  } as unknown as DeepRequired<MovingObject>;
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
  } as unknown as DeepRequired<StationaryObject>;
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
        value: LaneBoundary_Classification_Type.NO_LINE,
      },
      color: LaneBoundary_Classification_Color.WHITE,
    },
  } as unknown as DeepRequired<LaneBoundary>;
  const mockLane = {
    id: {
      value: 1000,
    },
    classification: {
      type: {
        value: Lane_Classification_Type.DRIVING,
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
    },
  } as unknown as DeepRequired<Lane>;
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
  } as GroundTruth;

  beforeEach(() => {
    mockExtensionContext.registerMessageConverter = mockRegisterMessageConverter;
    mockRegisterMessageConverter.mockClear();
  });

  it("registers the message converters", () => {
    activate(mockExtensionContext);
    expect(mockRegisterMessageConverter).toHaveBeenCalledTimes(5);
  });

  it("converts a simple message { fromSchemaName: osi_3_msgs/osi_GroundTruth toSchemaName: foxglove.SceneUpdate }", () => {
    activate(mockExtensionContext);
    const messageConverterArgs = mockRegisterMessageConverter.mock.calls[0][0];
    const result = messageConverterArgs.converter(mockMessageData);
    expect(result.deletions).toBeDefined();
    expect(result.entities).toBeDefined();
  });

  it("expect correct metadata for moving object", () => {
    activate(mockExtensionContext);

    /* eslint-disable @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
    const messageConverterArgs = mockRegisterMessageConverter.mock.calls[0][0];
    const result = messageConverterArgs.converter(mockMessageData) as SceneUpdate;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

    const vehicleEntity = result.entities.find((entity: SceneEntity) =>
      entity.metadata.some((m: KeyValuePair) => m.key === "moving_object_type"),
    );
    expect(vehicleEntity).toBeDefined();

    const metadata = vehicleEntity!.metadata;
    expect(metadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "acceleration",
          value: `${mockMovingObject.base.acceleration.x}, ${mockMovingObject.base.acceleration.y}, ${mockMovingObject.base.acceleration.z}`,
        }),
      ]),
    );
    expect(metadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "velocity",
          value: `${mockMovingObject.base.velocity.x}, ${mockMovingObject.base.velocity.y}, ${mockMovingObject.base.velocity.z}`,
        }),
      ]),
    );
    expect(metadata).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "assigned_lane_id",
          value: mockMovingObject.assigned_lane_id.map((id) => id.value).join(","),
        }),
      ]),
    );
  });
});

describe("OSI Visualizer: Moving Objects", () => {
  it("builds metadata  for vehicle moving objects", () => {
    const input = {
      type: 5,
      light_state: {
        indicator_state: 5,
        brake_light_state: 4,
        head_light: 3,
      },
    } as DeepRequired<MovingObject_VehicleClassification>;
    expect(buildVehicleMetadata(input)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "type",
          value: MovingObject_VehicleClassification_Type[input.type],
        }),
        expect.objectContaining({
          key: "light_state.indicator_state",
          value:
            MovingObject_VehicleClassification_LightState_IndicatorState[
              input.light_state.indicator_state
            ],
        }),
        expect.objectContaining({
          key: "light_state.brake_light_state",
          value:
            MovingObject_VehicleClassification_LightState_BrakeLightState[
              input.light_state.brake_light_state
            ],
        }),
        expect.objectContaining({
          key: "light_state.head_light",
          value:
            MovingObject_VehicleClassification_LightState_GenericLightState[
              input.light_state.head_light
            ],
        }),
      ]),
    );
  });
});

describe("OSI Visualizer: Lane Boundaries", () => {
  it("builds metadata for lane boundaries", () => {
    const mockLaneBoundaryPoint = {
      position: { x: 0, y: 0, z: 0 },
      width: 2.0,
      height: 0.0,
    } as DeepRequired<LaneBoundary_BoundaryPoint>;
    const mockLaneBoundary = {
      id: { value: 123 },
      classification: {
        type: LaneBoundary_Classification_Type.SOLID_LINE,
      },
      boundary_line: [mockLaneBoundaryPoint],
    } as DeepRequired<LaneBoundary>;

    expect(buildLaneBoundaryMetadata(mockLaneBoundary)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "type",
          value: LaneBoundary_Classification_Type[mockLaneBoundary.classification.type],
        }),
        expect.objectContaining({
          key: "color",
          value: LaneBoundary_Classification_Color[mockLaneBoundary.classification.color],
        }),
        expect.objectContaining({
          key: "width",
          value: mockLaneBoundaryPoint.width.toString(),
        }),
        expect.objectContaining({
          key: "height",
          value: mockLaneBoundaryPoint.height.toString(),
        }),
      ]),
    );
  });
});
