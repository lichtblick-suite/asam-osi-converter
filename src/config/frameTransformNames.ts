// const ROS_ROOT_FRAME = "<root>"; // proper frame UUID aliases are not supported
export const OSI_GLOBAL_FRAME = "global";
export const OSI_EGO_VEHICLE_BB_CENTER_FRAME = "ego_vehicle_bb_center";
export const OSI_EGO_VEHICLE_REAR_AXLE_FRAME = "ego_vehicle_rear_axle";
export const OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME = "virtual_mounting_position";

/**
 * Shared frame convention: "proj_frame" represents the geographic CRS world.
 *
 * When GroundTruth.proj_frame_offset is present, the OSI converter publishes
 * a FrameTransform with parent_frame_id="global" and child_frame_id="proj_frame".
 * This keeps "global" as the root of the frame tree (consistent with ego
 * transforms) and tells Lichtblick how to resolve "proj_frame" entities
 * (OpenDRIVE map geometry) into the "global" coordinate space.
 *
 * See: ASAM OSI GroundTruth.proj_frame_offset (osi_groundtruth.proto field 20)
 * See: ASAM OpenDRIVE §8.5 <offset> (same affine formula)
 */
export const OSI_PROJ_FRAME = "proj_frame";
