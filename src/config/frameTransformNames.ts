// const ROS_ROOT_FRAME = "<root>"; // proper frame UUID aliases are not supported
export const OSI_GLOBAL_FRAME = "global";
export const OSI_EGO_VEHICLE_BB_CENTER_FRAME = "ego_vehicle_bb_center";
export const OSI_EGO_VEHICLE_REAR_AXLE_FRAME = "ego_vehicle_rear_axle";
export const OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME = "virtual_mounting_position";

/**
 * Build a per-sensor virtual mounting position frame name.
 *
 * When multiple SensorData channels have different mounting positions,
 * each sensor needs its own frame to avoid frame-transform conflicts.
 * Uses sensor_id to create unique names:
 *   sensor_id=0 or absent  → "virtual_mounting_position"   (backward compatible)
 *   sensor_id=1            → "virtual_mounting_position_1"
 *   sensor_id=2            → "virtual_mounting_position_2"
 */
export function getSensorMountingFrameId(sensorId?: { value?: number }): string {
  if (sensorId?.value) {
    return `${OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME}_${sensorId.value}`;
  }
  return OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME;
}
