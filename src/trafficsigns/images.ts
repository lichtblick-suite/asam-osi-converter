import {
  TrafficSign_MainSign_Classification_Type as MAIN_TYPE,
  TrafficSign_SupplementarySign_Classification_Type as SUPPLEMENTARY_TYPE,
} from "@lichtblick/asam-osi-types";

import SUP_LEFT_ARROW from "../../assets/images/1000_10_supp_arrow_left.png";
import SUP_LEFT_BEND_ARROW from "../../assets/images/1000_11_supp_bendarrow_left.png";
import SUP_RIGHT_ARROW from "../../assets/images/1000_20_supp_arrow_right.png";
import SUP_RIGHT_BEND_ARROW from "../../assets/images/1000_21_supp_bendarrow_right.png";
import SUP_ARROW from "../../assets/images/1000_XX_arrow.png";
import SUP_VALID_FOR_DISTANCE from "../../assets/images/1001_30_supp_distance_arrow.png";
import SUP_PRIORITY_ROAD_BOTTOM_LEFT_FOUR_WAY from "../../assets/images/1002_10_prio_bottom_left_four_way.png";
import SUP_PRIORITY_ROAD_TOP_LEFT_FOUR_WAY from "../../assets/images/1002_11_prio_top_left_four_way.png";
import SUP_PRIORITY_ROAD_BOTTOM_LEFT_THREE_WAY_STRAIGHT from "../../assets/images/1002_12_prio_bottom_left_three_way_straight.png";
import SUP_PRIORITY_ROAD_BOTTOM_LEFT_THREE_WAY_SIDEWAYS from "../../assets/images/1002_13_prio_bottom_left_three_way_sideways.png";
import SUP_PRIORITY_ROAD_TOP_LEFT_THREE_WAY_STRAIGHT from "../../assets/images/1002_14_prio_top_left_three_way_straight.png";
import SUP_PRIORITY_ROAD_BOTTOM_RIGHT_FOUR_WAY from "../../assets/images/1002_20_prio_bottom_right_four_way_straight.png";
import SUP_PRIORITY_ROAD_TOP_RIGHT_FOUR_WAY from "../../assets/images/1002_21_prio_top_right_four_way_straight.png";
import SUP_PRIORITY_ROAD_BOTTOM_RIGHT_THREE_WAY_STRAIGHT from "../../assets/images/1002_22_prio_bottom_right_three_way_straight.png";
import SUP_PRIORITY_ROAD_BOTTOM_RIGHT_THREE_WAY_SIDEWAY from "../../assets/images/1002_23_prio_bottom_right_three_way_sideway.png";
import SUP_PRIORITY_ROAD_TOP_RIGHT_THREE_WAY_STRAIGHT from "../../assets/images/1002_24_prio_top_right_three_way_straight.png";
import SUP_VALID_IN_DISTANCE from "../../assets/images/1004_30_supp_sign_valid_in.png";
import SUP_STOP_IN from "../../assets/images/1004_32_supp_stop_in.png";
import SUP_ACCIDENT from "../../assets/images/1006_31_hazard.png";
import SUP_SNOW from "../../assets/images/1007_30_supp_snow.png";
import SUP_FOG from "../../assets/images/1007_61_supp_fog.png";
import SUP_TEXT from "../../assets/images/1007_text.png";
import SUP_TRAILER from "../../assets/images/1010_12_supp_trailer.png";
import SUP_ROLLING_HIGHWAY_INFORMATION from "../../assets/images/1010_14_rolling_highway_info.png";
import SUP_SERVICES from "../../assets/images/1010_15_services.png";
import SUP_TRUCK from "../../assets/images/1010_51_supp_truck.png";
import SUP_CAR from "../../assets/images/1010_58_supp_car.png";
import SUP_TRACTORS_MAY_BE_PASSED from "../../assets/images/1010_61_supp_tractor.png";
import SUP_MOTORCYCLE from "../../assets/images/1010_62_supp_motorcycle.png";
import FLIGHT from "../../assets/images/101_10_flight.png";
import CATTLE from "../../assets/images/101_12_cattle.png";
import HORSE_RIDERS from "../../assets/images/101_13_horse_riders.png";
import AMPHIBIANS from "../../assets/images/101_14_amphibians.png";
import FALLING_ROCKS from "../../assets/images/101_15_falling_rocks.png";
import SNOW_OR_ICE from "../../assets/images/101_51_snow_or_ice.png";
import LOOSE_GRAVEL from "../../assets/images/101_52_loose_gravel.png";
import WATERSIDE from "../../assets/images/101_53_waterside.png";
import CLEARANCE from "../../assets/images/101_54_clearance.png";
import MOVABLE_BRIDGE from "../../assets/images/101_55_movable_bridge.png";
import DANGER_SPOT from "../../assets/images/101_danger_ahead.png";
import SUP_MOTORCYCLE_ALLOWED from "../../assets/images/1022_12_supp_motorcycle_allowed.png";
import RIGHT_BEFORE_LEFT_NEXT_INTERSECTION from "../../assets/images/102_unmarked_intersection.png";
import TURN_LEFT from "../../assets/images/103_1_turn_left.png";
import TURN_RIGHT from "../../assets/images/103_2_turn_right.png";
import SUP_TIME_RANGE from "../../assets/images/1040_30_supp_time_range.png";
import SUP_PARKING_DISC_TIME_RESTRICTION from "../../assets/images/1040_32_parking_disc_time.png";
import SUP_TIME from "../../assets/images/104X_time.png";
import SUP_HAZARDOUS from "../../assets/images/1052_30_hazardous_goods.png";
import SUP_WEIGHT from "../../assets/images/1053_33_supp_weight.png";
import SUP_WET from "../../assets/images/1053_35_supp_rain.png";
import SUP_RAIN from "../../assets/images/1053_35_supp_rain.png";
import SUP_PARKING_CONSTRAINT from "../../assets/images/1053_38_parking_contraints.png";
import DOUBLE_TURN_LEFT from "../../assets/images/105_1_double_turn_left.png";
import DOUBLE_TURN_RIGHT from "../../assets/images/105_2_double_turn_right.png";
import SUP_NO_WAITING_SIDE_STRIPES from "../../assets/images/1060_31_no_waiting_side_stripes.png";
import HILL_DOWNWARDS from "../../assets/images/108_steep_hill_downwards.png";
import SUP_CONSTRAINED_TO from "../../assets/images/10XX_constrained_to.png";
import SUP_EXCEPT from "../../assets/images/10XX_except.png";
import SUP_SPACE from "../../assets/images/10XX_space.png";
import HILL_UPWARDS from "../../assets/images/110_steep_hill_upwards.png";
import UNEVEN_ROAD from "../../assets/images/112_uneven_road.png";
import ROAD_SLIPPERY_WET_OR_DIRTY from "../../assets/images/114_road_slippery.png";
import SIDE_WINDS from "../../assets/images/117_10_side_winds.png";
import ROAD_NARROWING from "../../assets/images/120_road_narrowing.png";
import ROAD_NARROWING_RIGHT from "../../assets/images/121_1_road_narrowing_right.png";
import ROAD_NARROWING_LEFT from "../../assets/images/121_2_road_narrowing_left.png";
import ROAD_WORKS from "../../assets/images/123_road_works.png";
import TRAFFIC_QUEUES from "../../assets/images/124_traffic_jam_warning.png";
import TWO_WAY_TRAFFIC from "../../assets/images/125_two_way_traffic.png";
import ATTENTION_TRAFFIC_LIGHT from "../../assets/images/131_traffic_signals.png";
import PEDESTRIANS from "../../assets/images/133_10_pedestrian_warning.png";
import CHILDREN_CROSSING from "../../assets/images/136_10_children_crossing.png";
import CYCLE_ROUTE from "../../assets/images/138_10_bicycle_warning.png";
import DEER_CROSSING from "../../assets/images/142_10_wild_animals.png";
import UNGATED_LEVEL_CROSSING from "../../assets/images/151_ungated_level_crossing.png";
import LEVEL_CROSSING_MARKER from "../../assets/images/156_10_level_crossing_marker.png";
import RAILWAY_TRAFFIC_PRIORITY from "../../assets/images/201_51_railway_priority.png";
import GIVE_WAY from "../../assets/images/205_give_way.png";
import ROUNDABOUT from "../../assets/images/205_roundabout.png";
import STOP from "../../assets/images/206_stop.png";
import PRIORITY_TO_OPPOSITE_DIRECTION from "../../assets/images/208_priority_to_other_direction.png";
import PRIORITY_TO_OPPOSITE_DIRECTION_UPSIDE_DOWN from "../../assets/images/208_priority_to_other_direction_swaped.png";
import PRESCRIBED_LEFT_TURN from "../../assets/images/209_10_prescribed_left_turn.png";
import PRESCRIBED_RIGHT_TURN from "../../assets/images/209_20_prescribed_right_turn.png";
import PRESCRIBED_STRAIGHT from "../../assets/images/209_30_prescribed_straight.png";
import PRESCRIBED_LEFT_WAY from "../../assets/images/211_10_prescribed_left_way.png";
import PRESCRIBED_RIGHT_WAY from "../../assets/images/211_20_prescribed_right_way.png";
import PRESCRIBED_LEFT_TURN_AND_STRAIGHT from "../../assets/images/214_10_prescribed_left_and_straight.png";
import PRESCRIBED_RIGHT_TURN_AND_STRAIGHT from "../../assets/images/214_20_prescribed_right_and_straight.png";
import PRESCRIBED_LEFT_TURN_AND_RIGHT_TURN from "../../assets/images/214_30_prescribed_left_and_right.png";
// import PRESCRIBED_LEFT_TURN_RIGHT_TURN_AND_STRAIGHT from "../../assets/images/";
import ONEWAY_LEFT from "../../assets/images/220_1_one_way_left.png";
import ONEWAY_RIGHT from "../../assets/images/220_2_one_way_right.png";
import PASS_LEFT from "../../assets/images/222_1_pass_left.png";
import PASS_RIGHT from "../../assets/images/222_2_pass_right.png";
import SIDE_LANE_OPEN_FOR_TRAFFIC from "../../assets/images/223_1_50_side_lane_open.png";
import SIDE_LANE_CLOSED_FOR_TRAFFIC from "../../assets/images/223_2_50_side_lane_closed.png";
import SIDE_LANE_CLOSING_FOR_TRAFFIC from "../../assets/images/223_3_50_side_lane_closing.png";
import BUS_STOP from "../../assets/images/224_bus_stop.png";
import TAXI_STAND from "../../assets/images/229_taxi_stand.png";
import BICYCLES_ONLY from "../../assets/images/237_bicycles_only.png";
import HORSE_RIDERS_ONLY from "../../assets/images/238_horse_riders_only.png";
import PEDESTRIANS_ONLY from "../../assets/images/239_pedestrians_only.png";
import BICYCLES_PEDESTRIANS_SHARED_ONLY from "../../assets/images/240_shared_pedestrian_bicycle_lane.png";
import BICYCLES_PEDESTRIANS_SEPARATED_LEFT_ONLY from "../../assets/images/241_30_separated_pedestrian_bicycle_left_lane.png";
import BICYCLES_PEDESTRIANS_SEPARATED_RIGHT_ONLY from "../../assets/images/241_30_separated_pedestrian_bicycle_right_lane.png";
import PEDESTRIAN_ZONE_BEGIN from "../../assets/images/242_1_pedestrian_zone_begin.png";
import PEDESTRIAN_ZONE_END from "../../assets/images/242_2_pedestrian_zone_end.png";
import BICYCLE_ROAD_BEGIN from "../../assets/images/244_1_bicycle_road_begin.png";
import BICYCLE_ROAD_END from "../../assets/images/244_2_bicycle_road_end.png";
import BUS_LANE from "../../assets/images/245_bus_lane.png";
import BUS_LANE_BEGIN from "../../assets/images/245_bus_lane.png";
import ALL_PROHIBITED from "../../assets/images/250_no_vehicles.png";
import MOTORIZED_MULTITRACK_PROHIBITED from "../../assets/images/251_no_motor_except_solo_motor_cycle.png";
import TRUCKS_PROHIBITED from "../../assets/images/253_no_truck.png";
import BICYCLES_PROHIBITED from "../../assets/images/254_no_bicycle.png";
import MOTORCYCLES_PROHIBITED from "../../assets/images/255_no_solo_motor_cycle.png";
import MOPEDS_PROHIBITED from "../../assets/images/257_50_no_moped.png";
import HORSE_RIDERS_PROHIBITED from "../../assets/images/257_51_no_horse_riders.png";
import HORSE_CARRIAGES_PROHIBITED from "../../assets/images/257_52_no_horse_carriage.png";
import CATTLE_PROHIBITED from "../../assets/images/257_53_no_cattle.png";
import BUSES_PROHIBITED from "../../assets/images/257_54_no_buses.png";
import CARS_PROHIBITED from "../../assets/images/257_55_no_cars.png";
import CARS_TRAILERS_PROHIBITED from "../../assets/images/257_56_no_car_trailers.png";
import TRUCKS_TRAILERS_PROHIBITED from "../../assets/images/257_57_no_truck_trailers.png";
import TRACTORS_PROHIBITED from "../../assets/images/257_58_no_tractors.png";
import PEDESTRIANS_PROHIBITED from "../../assets/images/259_no_pedestrian.png";
import MOTOR_VEHICLES_PROHIBITED from "../../assets/images/260_no_motor.png";
import HAZARDOUS_GOODS_VEHICLES_PROHIBITED from "../../assets/images/261_no_hazardous_goods.png";
import OVER_WEIGHT_VEHICLES_PROHIBITED from "../../assets/images/262_no_overweight.png";
import VEHICLES_AXLE_OVER_WEIGHT_PROHIBITED from "../../assets/images/263_no_axle_overweight.png";
import VEHICLES_EXCESS_WIDTH_PROHIBITED from "../../assets/images/264_no_over_width.png";
import VEHICLES_EXCESS_HEIGHT_PROHIBITED from "../../assets/images/265_no_over_height.png";
import VEHICLES_EXCESS_LENGTH_PROHIBITED from "../../assets/images/266_no_over_length.png";
import DO_NOT_ENTER from "../../assets/images/267_no_entry.png";
import SNOW_CHAINS_REQUIRED from "../../assets/images/268_snow_chain_required.png";
import WATER_POLLUTANT_VEHICLES_PROHIBITED from "../../assets/images/269_no_water_pollutant.png";
import ENVIRONMENTAL_ZONE_BEGIN from "../../assets/images/270_1_environment_zone.png";
import ENVIRONMENTAL_ZONE_END from "../../assets/images/270_2_environment_zone_end.png";
import NO_U_TURN_LEFT from "../../assets/images/272_no_u_turn_left.png";
import NO_U_TURN_RIGHT from "../../assets/images/272_no_u_turn_right.png";
import MINIMUM_DISTANCE_FOR_TRUCKS from "../../assets/images/273_minimum_following_distance.png";
import SPEED_LIMIT_ZONE_BEGIN from "../../assets/images/274_1_30_Zone_entry.png";
import SPEED_LIMIT_ZONE_END from "../../assets/images/274_2_30_Zone_end.png";
import SPEED_LIMIT_BEGIN from "../../assets/images/274_speed_limits.png";
import MINIMUM_SPEED_BEGIN from "../../assets/images/275_speed_minimums.png";
import OVERTAKING_BAN_BEGIN from "../../assets/images/276_no_overtaking.png";
import OVERTAKING_BAN_FOR_TRUCKS_BEGIN from "../../assets/images/277_no_overtaking_truck.png";
import SPEED_LIMIT_END from "../../assets/images/278_speed_limits_end.png";
import MINIMUM_SPEED_END from "../../assets/images/279_speed_minimums_end.png";
import OVERTAKING_BAN_END from "../../assets/images/280_no_overtaking_end.png";
import OVERTAKING_BAN_FOR_TRUCKS_END from "../../assets/images/281_no_overtaking_truck_end.png";
import ALL_RESTRICTIONS_END from "../../assets/images/282_end_restriction_general.png";
import NO_STOPPING from "../../assets/images/283_no_stopping.png";
import NO_PARKING from "../../assets/images/286_no_parking.png";
import NO_PARKING_ZONE_BEGIN from "../../assets/images/290_1_no_parking_zone.png";
import NO_PARKING_ZONE_END from "../../assets/images/290_2_no_parking_zone_end.png";
import RIGHT_OF_WAY_NEXT_INTERSECTION from "../../assets/images/301_priority_at_next_intersection.png";
import RIGHT_OF_WAY_BEGIN from "../../assets/images/306_priority_road.png";
import RIGHT_OF_WAY_END from "../../assets/images/307_priority_road_end.png";
import PRIORITY_OVER_OPPOSITE_DIRECTION from "../../assets/images/308_priority_over_other_direction.png";
import PRIORITY_OVER_OPPOSITE_DIRECTION_UPSIDE_DOWN from "../../assets/images/308_priority_over_other_direction_swaped.png";
import TOWN_BEGIN from "../../assets/images/310_city_entrance.png";
import TOWN_END from "../../assets/images/311_city_exit.png";
import CAR_PARKING_ZONE_BEGIN from "../../assets/images/314_1_parking_management_zone_entrance.png";
import CAR_PARKING_ZONE_END from "../../assets/images/314_2_parking_management_zone_exit.png";
import CAR_PARKING from "../../assets/images/314_parking_area.png";
import SIDEWALK_HALF_PARKING_LEFT from "../../assets/images/315_50_half_parking_left.png";
import SIDEWALK_HALF_PARKING_RIGHT from "../../assets/images/315_55_half_parking_right.png";
import SIDEWALK_PARKING_LEFT from "../../assets/images/315_60_parking_left.png";
import SIDEWALK_PARKING_RIGHT from "../../assets/images/315_65_parking_right.png";
import SIDEWALK_PERPENDICULAR_HALF_PARKING_LEFT from "../../assets/images/315_70_half_parking_perpendicular_left.png";
import SIDEWALK_PERPENDICULAR_HALF_PARKING_RIGHT from "../../assets/images/315_75_half_parking_perpendicular_right.png";
import SIDEWALK_PERPENDICULAR_PARKING_LEFT from "../../assets/images/315_80_parking_perpendicular_left.png";
import SIDEWALK_PERPENDICULAR_PARKING_RIGHT from "../../assets/images/315_85_parking_perpendicular_right.png";
import LIVING_STREET_BEGIN from "../../assets/images/325_1_traffic_calming_zone.png";
import LIVING_STREET_END from "../../assets/images/325_2_traffic_calming_zone_end.png";
import TUNNEL from "../../assets/images/327_tunnel.png";
import EMERGENCY_STOPPING_LEFT from "../../assets/images/328_emergency_stop_left.png";
import EMERGENCY_STOPPING_RIGHT from "../../assets/images/328_emergency_stop_right.png";
import HIGHWAY_BEGIN from "../../assets/images/330_1_motorway_entrance.png";
import HIGHWAY_END from "../../assets/images/330_2_motorway_end.png";
import EXPRESSWAY_BEGIN from "../../assets/images/331_1_expressway_entrance.png";
import EXPRESSWAY_END from "../../assets/images/331_2_expressway_end.png";
import NAMED_ROAD_EXIT from "../../assets/images/332_1_20_named_road_exit.png";
import NAMED_EXPRESSWAY_EXIT from "../../assets/images/332_1_named_expressway_exit.png";
import NAMED_HIGHWAY_EXIT from "../../assets/images/332_named_highway_exit.png";
import EXPRESSWAY_EXIT from "../../assets/images/333_1_expressway_exit.png";
import HIGHWAY_EXIT from "../../assets/images/333_exit_from_motorway.png";
import ZEBRA_CROSSING from "../../assets/images/350_pedestrian_crossing.png";
import ONEWAY_STREET from "../../assets/images/353_one_way_street.png";
import CROSSING_GUARDS from "../../assets/images/356_crossing_guards.png";
import DEADEND_EXCLUDING_DESIGNATED_ACTORS from "../../assets/images/357_5X_dead_end_excluding.png";
import DEADEND from "../../assets/images/357_dead_end.png";
import FIRST_AID_STATION from "../../assets/images/358_first_aid_station.png";
import POLICE_STATION from "../../assets/images/363_polizei.png";
import HOTEL from "../../assets/images/365_55_hotel.png";
import INN from "../../assets/images/365_56_inn.png";
import KIOSK from "../../assets/images/365_57_kiosk.png";
import TOILET from "../../assets/images/365_58_toilets.png";
import CHAPEL from "../../assets/images/365_59_chapel.png";
import FILLING_STATION from "../../assets/images/365_5X_filling_station.png";
import TELEPHONE from "../../assets/images/365_5X_telephone.png";
import TOURIST_INFO from "../../assets/images/365_61_tourist_info.png";
import REPAIR_SERVICE from "../../assets/images/365_62_repair_service.png";
import PEDESTRIAN_UNDERPASS from "../../assets/images/365_63_pedestrian_underpass.png";
import PEDESTRIAN_BRIDGE from "../../assets/images/365_64_pedestrian_bridge.png";
import CAMPER_PLACE from "../../assets/images/365_67_camper_place.png";
import ADVISORY_SPEED_LIMIT_BEGIN from "../../assets/images/380_advisory_speed_limit_begin.png";
import ADVISORY_SPEED_LIMIT_END from "../../assets/images/381_advisory_speed_limit_end.png";
import PLACE_NAME from "../../assets/images/385_place_name.png";
import TOURIST_ATTRACTION from "../../assets/images/386_1_tourist_attraction.png";
import TOURIST_ROUTE from "../../assets/images/386_2_tourist_route.png";
import TOURIST_AREA from "../../assets/images/386_3_tourist_area.png";
import SHOULDER_NOT_PASSABLE_MOTOR_VEHICLES from "../../assets/images/388_shoulder_unsafe_for_multi_track.png";
import SHOULDER_UNSAFE_TRUCKS_TRACTORS from "../../assets/images/389_shoulder_unsafe_for_heavy_vehicle.png";
import TOLL_END from "../../assets/images/390_2_toll_end.png";
import TOLL_BEGIN from "../../assets/images/390_toll_begin.png";
import TOLL_ROAD from "../../assets/images/391_toll_road.png";
import CUSTOMS from "../../assets/images/392_customs.png";
import INTERNATIONAL_BORDER_INFO from "../../assets/images/393_international_border_info.png";
import STREETLIGHT_RED_BAND from "../../assets/images/394_street_light_red_band.png";
import FEDERAL_HIGHWAY_ROUTE_NUMBER from "../../assets/images/401_federal_street_number.png";
import HIGHWAY_ROUTE_NUMBER from "../../assets/images/405_highway.png";
import HIGHWAY_INTERCHANGE_NUMBER from "../../assets/images/406_50_highway_interchange_number.png";
import EUROPEAN_ROUTE_NUMBER from "../../assets/images/410_european_route_number.png";
import FEDERAL_HIGHWAY_DIRECTION_LEFT from "../../assets/images/415_10_federal_highway_left.png";
import FEDERAL_HIGHWAY_DIRECTION_RIGHT from "../../assets/images/415_20_federal_highway_right.png";
import PRIMARY_ROAD_DIRECTION_LEFT from "../../assets/images/418_10_primary_road_left.png";
import PRIMARY_ROAD_DIRECTION_RIGHT from "../../assets/images/418_20_primary_road_right.png";
import SECONDARY_ROAD_DIRECTION_LEFT from "../../assets/images/419_10_secondary_road_left.png";
import SECONDARY_ROAD_DIRECTION_RIGHT from "../../assets/images/419_20_secondary_road_right.png";
import DIRECTION_DESIGNATED_ACTORS_LEFT from "../../assets/images/421_1X_actors_left.png";
import DIRECTION_DESIGNATED_ACTORS_RIGHT from "../../assets/images/421_2X_actors_right.png";
import ROUTING_DESIGNATED_ACTORS from "../../assets/images/422_routing_actors.png";
import DIRECTION_TO_HIGHWAY_LEFT from "../../assets/images/430_10_highway_direction_left.png";
import DIRECTION_TO_HIGHWAY_RIGHT from "../../assets/images/430_20_highway_direction_right.png";
import DIRECTION_TO_LOCAL_DESTINATION_LEFT from "../../assets/images/432_10_local_direction_left.png";
import DIRECTION_TO_LOCAL_DESTINATION_RIGHT from "../../assets/images/432_20_local_direction_right.png";
import CONSOLIDATED_DIRECTIONS from "../../assets/images/434_consolidated_directions.png";
import STREET_NAME from "../../assets/images/437_street_name.png";
import DIRECTION_PREANNOUNCEMENT from "../../assets/images/438_direction_preannouncement.png";
import DIRECTION_PREANNOUNCEMENT_LANE_CONFIG from "../../assets/images/439_direction_preannouncement_lane_config.png";
import DIRECTION_PREANNOUNCEMENT_HIGHWAY_ENTRIES from "../../assets/images/440_direction_preannouncement_with_highway.png";
import HIGHWAY_ANNOUNCEMENT_TRUCK_STOP from "../../assets/images/448_1_announcement_truck_stop.png";
import OTHER_ROAD_ANNOUNCEMENT from "../../assets/images/448_50_other_street_from_highway.png";
import HIGHWAY_ANNOUNCEMENT from "../../assets/images/448_highway_announcement.png";
import HIGHWAY_PREANNOUNCEMENT_DIRECTIONS from "../../assets/images/449_highway_preannouncement_direction.png";
import POLE_EXIT from "../../assets/images/450_motorway_interchange_countdown_100.png";
import HIGHWAY_DISTANCE_BOARD from "../../assets/images/453_highway_distance_board.png";
import DETOUR_LEFT from "../../assets/images/454_10_detour_left.png";
import DETOUR_RIGHT from "../../assets/images/454_20_detour_right.png";
import NUMBERED_DETOUR from "../../assets/images/455_numbered_detour.png";
import DETOUR_BEGIN from "../../assets/images/457_1_detour_begin.png";
import DETOUR_END from "../../assets/images/457_2_detour_end.png";
import DETOUR_ROUTING_BOARD from "../../assets/images/458_detour_routing_board.png";
import OPTIONAL_DETOUR from "../../assets/images/460_optional_detour.png";
import OPTIONAL_DETOUR_ROUTING from "../../assets/images/466_optional_detour_routing.png";
import ROUTE_RECOMMENDATION from "../../assets/images/467_1_route_recommandation.png";
import ROUTE_RECOMMENDATION_END from "../../assets/images/467_2_route_recommendation_end.png";
import ANNOUNCE_LANE_TRANSITION_LEFT from "../../assets/images/501_1X_announce_lane_transition_left.png";
import ANNOUNCE_LANE_TRANSITION_RIGHT from "../../assets/images/501_2X_announce_lane_transition_right.png";
import ANNOUNCE_RIGHT_LANE_END from "../../assets/images/531_10_lane_reduction_right.png";
import ANNOUNCE_LEFT_LANE_END from "../../assets/images/531_20_lane_reduction_left.png";
import ANNOUNCE_LEFT_LANE_BEGIN from "../../assets/images/541_10_announce_left_lane_begin.png";
import ANNOUNCE_RIGHT_LANE_BEGIN from "../../assets/images/541_20_announce_right_lane_begin.png";
import ANNOUNCE_LANE_CONSOLIDATION from "../../assets/images/551_lane_consolidation.png";
import DETOUR_CITY_BLOCK from "../../assets/images/590_1X_detour_city_block.png";
import GATE from "../../assets/images/600_gate.png";
import POLE_WARNING from "../../assets/images/605_obstruction_right.png";
import TRAFFIC_CONE from "../../assets/images/610_traffic_cone.png";
import MOBILE_LANE_CLOSURE from "../../assets/images/615_mobile_lane_closure.png";
import DIRECTIONAL_BOARD_WARNING from "../../assets/images/625_directional_board_warning.png";
import GUIDING_PLATE_WEDGES from "../../assets/images/626_31_guiding_plate_wedges.png";
import GUIDING_PLATE from "../../assets/images/626_guiding_plate.png";
import REFLECTOR_POST from "../../assets/images/62X_40_reflector_post.png";
import PARKING_HAZARD from "../../assets/images/630_parking_hazard.png";
import TRAFFIC_LIGHT_GREEN_ARROW from "../../assets/images/720_green_arrow.png";
import BUS_LANE_END from "../../assets/images/No_Number_bus_lane_end.png";
import OTHER from "../../assets/images/No_Number_other.png";
import PRESCRIBED_U_TURN_LEFT from "../../assets/images/No_Number_prescribed_u_turn_left.png";
import PRESCRIBED_U_TURN_RIGHT from "../../assets/images/No_Number_prescribed_u_turn_right.png";
import SUP_NIGHT from "../../assets/images/No_Number_supp_night.png";
import SUP_NO_SIGN from "../../assets/images/No_Number_supp_no_sign.png";
import SUP_OTHER from "../../assets/images/No_Number_supp_other.png";
import SUP_SNOW_RAIN from "../../assets/images/No_Number_supp_snowrain.png";
import SUP_STOP_4_WAY from "../../assets/images/No_Number_supp_stop_4_way.png";
import SUP_UNKNOWN from "../../assets/images/No_Number_supp_unknown.png";
import SUP_ZONE from "../../assets/images/No_Number_supp_zone.png";
import UNKNOWN from "../../assets/images/No_Number_unknown.png";

export default {
  main: {
    [MAIN_TYPE.UNKNOWN]: UNKNOWN,
    [MAIN_TYPE.OTHER]: OTHER,
    [MAIN_TYPE.DANGER_SPOT]: DANGER_SPOT,
    [MAIN_TYPE.ZEBRA_CROSSING]: ZEBRA_CROSSING,
    [MAIN_TYPE.FLIGHT]: FLIGHT,
    [MAIN_TYPE.CATTLE]: CATTLE,
    [MAIN_TYPE.HORSE_RIDERS]: HORSE_RIDERS,
    [MAIN_TYPE.AMPHIBIANS]: AMPHIBIANS,
    [MAIN_TYPE.FALLING_ROCKS]: FALLING_ROCKS,
    [MAIN_TYPE.SNOW_OR_ICE]: SNOW_OR_ICE,
    [MAIN_TYPE.LOOSE_GRAVEL]: LOOSE_GRAVEL,
    [MAIN_TYPE.WATERSIDE]: WATERSIDE,
    [MAIN_TYPE.CLEARANCE]: CLEARANCE,
    [MAIN_TYPE.MOVABLE_BRIDGE]: MOVABLE_BRIDGE,
    [MAIN_TYPE.RIGHT_BEFORE_LEFT_NEXT_INTERSECTION]: RIGHT_BEFORE_LEFT_NEXT_INTERSECTION,
    [MAIN_TYPE.TURN_LEFT]: TURN_LEFT,
    [MAIN_TYPE.TURN_RIGHT]: TURN_RIGHT,
    [MAIN_TYPE.DOUBLE_TURN_LEFT]: DOUBLE_TURN_LEFT,
    [MAIN_TYPE.DOUBLE_TURN_RIGHT]: DOUBLE_TURN_RIGHT,
    [MAIN_TYPE.HILL_DOWNWARDS]: HILL_DOWNWARDS,
    [MAIN_TYPE.HILL_UPWARDS]: HILL_UPWARDS,
    [MAIN_TYPE.UNEVEN_ROAD]: UNEVEN_ROAD,
    [MAIN_TYPE.ROAD_SLIPPERY_WET_OR_DIRTY]: ROAD_SLIPPERY_WET_OR_DIRTY,
    [MAIN_TYPE.SIDE_WINDS]: SIDE_WINDS,
    [MAIN_TYPE.ROAD_NARROWING]: ROAD_NARROWING,
    [MAIN_TYPE.ROAD_NARROWING_RIGHT]: ROAD_NARROWING_RIGHT,
    [MAIN_TYPE.ROAD_NARROWING_LEFT]: ROAD_NARROWING_LEFT,
    [MAIN_TYPE.ROAD_WORKS]: ROAD_WORKS,
    [MAIN_TYPE.TRAFFIC_QUEUES]: TRAFFIC_QUEUES,
    [MAIN_TYPE.TWO_WAY_TRAFFIC]: TWO_WAY_TRAFFIC,
    [MAIN_TYPE.ATTENTION_TRAFFIC_LIGHT]: ATTENTION_TRAFFIC_LIGHT,
    [MAIN_TYPE.PEDESTRIANS]: PEDESTRIANS,
    [MAIN_TYPE.CHILDREN_CROSSING]: CHILDREN_CROSSING,
    [MAIN_TYPE.CYCLE_ROUTE]: CYCLE_ROUTE,
    [MAIN_TYPE.DEER_CROSSING]: DEER_CROSSING,
    [MAIN_TYPE.UNGATED_LEVEL_CROSSING]: UNGATED_LEVEL_CROSSING,
    [MAIN_TYPE.LEVEL_CROSSING_MARKER]: LEVEL_CROSSING_MARKER,
    [MAIN_TYPE.RAILWAY_TRAFFIC_PRIORITY]: RAILWAY_TRAFFIC_PRIORITY,
    [MAIN_TYPE.GIVE_WAY]: GIVE_WAY,
    [MAIN_TYPE.STOP]: STOP,
    [MAIN_TYPE.PRIORITY_TO_OPPOSITE_DIRECTION]: PRIORITY_TO_OPPOSITE_DIRECTION,
    [MAIN_TYPE.PRIORITY_TO_OPPOSITE_DIRECTION_UPSIDE_DOWN]:
      PRIORITY_TO_OPPOSITE_DIRECTION_UPSIDE_DOWN,
    [MAIN_TYPE.PRESCRIBED_LEFT_TURN]: PRESCRIBED_LEFT_TURN,
    [MAIN_TYPE.PRESCRIBED_RIGHT_TURN]: PRESCRIBED_RIGHT_TURN,
    [MAIN_TYPE.PRESCRIBED_STRAIGHT]: PRESCRIBED_STRAIGHT,
    [MAIN_TYPE.PRESCRIBED_RIGHT_WAY]: PRESCRIBED_RIGHT_WAY,
    [MAIN_TYPE.PRESCRIBED_LEFT_WAY]: PRESCRIBED_LEFT_WAY,
    [MAIN_TYPE.PRESCRIBED_RIGHT_TURN_AND_STRAIGHT]: PRESCRIBED_RIGHT_TURN_AND_STRAIGHT,
    [MAIN_TYPE.PRESCRIBED_LEFT_TURN_AND_STRAIGHT]: PRESCRIBED_LEFT_TURN_AND_STRAIGHT,
    [MAIN_TYPE.PRESCRIBED_LEFT_TURN_AND_RIGHT_TURN]: PRESCRIBED_LEFT_TURN_AND_RIGHT_TURN,
    [MAIN_TYPE.PRESCRIBED_LEFT_TURN_RIGHT_TURN_AND_STRAIGHT]: "",
    [MAIN_TYPE.ROUNDABOUT]: ROUNDABOUT,
    [MAIN_TYPE.ONEWAY_LEFT]: ONEWAY_LEFT,
    [MAIN_TYPE.ONEWAY_RIGHT]: ONEWAY_RIGHT,
    [MAIN_TYPE.PASS_LEFT]: PASS_LEFT,
    [MAIN_TYPE.PASS_RIGHT]: PASS_RIGHT,
    [MAIN_TYPE.SIDE_LANE_OPEN_FOR_TRAFFIC]: SIDE_LANE_OPEN_FOR_TRAFFIC,
    [MAIN_TYPE.SIDE_LANE_CLOSED_FOR_TRAFFIC]: SIDE_LANE_CLOSED_FOR_TRAFFIC,
    [MAIN_TYPE.SIDE_LANE_CLOSING_FOR_TRAFFIC]: SIDE_LANE_CLOSING_FOR_TRAFFIC,
    [MAIN_TYPE.BUS_STOP]: BUS_STOP,
    [MAIN_TYPE.TAXI_STAND]: TAXI_STAND,
    [MAIN_TYPE.BICYCLES_ONLY]: BICYCLES_ONLY,
    [MAIN_TYPE.HORSE_RIDERS_ONLY]: HORSE_RIDERS_ONLY,
    [MAIN_TYPE.PEDESTRIANS_ONLY]: PEDESTRIANS_ONLY,
    [MAIN_TYPE.BICYCLES_PEDESTRIANS_SHARED_ONLY]: BICYCLES_PEDESTRIANS_SHARED_ONLY,
    [MAIN_TYPE.BICYCLES_PEDESTRIANS_SEPARATED_LEFT_ONLY]: BICYCLES_PEDESTRIANS_SEPARATED_LEFT_ONLY,
    [MAIN_TYPE.BICYCLES_PEDESTRIANS_SEPARATED_RIGHT_ONLY]:
      BICYCLES_PEDESTRIANS_SEPARATED_RIGHT_ONLY,
    [MAIN_TYPE.PEDESTRIAN_ZONE_BEGIN]: PEDESTRIAN_ZONE_BEGIN,
    [MAIN_TYPE.PEDESTRIAN_ZONE_END]: PEDESTRIAN_ZONE_END,
    [MAIN_TYPE.BICYCLE_ROAD_BEGIN]: BICYCLE_ROAD_BEGIN,
    [MAIN_TYPE.BICYCLE_ROAD_END]: BICYCLE_ROAD_END,
    [MAIN_TYPE.BUS_LANE]: BUS_LANE,
    [MAIN_TYPE.BUS_LANE_BEGIN]: BUS_LANE_BEGIN,
    [MAIN_TYPE.BUS_LANE_END]: BUS_LANE_END,
    [MAIN_TYPE.ALL_PROHIBITED]: ALL_PROHIBITED,
    [MAIN_TYPE.MOTORIZED_MULTITRACK_PROHIBITED]: MOTORIZED_MULTITRACK_PROHIBITED,
    [MAIN_TYPE.TRUCKS_PROHIBITED]: TRUCKS_PROHIBITED,
    [MAIN_TYPE.BICYCLES_PROHIBITED]: BICYCLES_PROHIBITED,
    [MAIN_TYPE.MOTORCYCLES_PROHIBITED]: MOTORCYCLES_PROHIBITED,
    [MAIN_TYPE.MOPEDS_PROHIBITED]: MOPEDS_PROHIBITED,
    [MAIN_TYPE.HORSE_RIDERS_PROHIBITED]: HORSE_RIDERS_PROHIBITED,
    [MAIN_TYPE.HORSE_CARRIAGES_PROHIBITED]: HORSE_CARRIAGES_PROHIBITED,
    [MAIN_TYPE.CATTLE_PROHIBITED]: CATTLE_PROHIBITED,
    [MAIN_TYPE.BUSES_PROHIBITED]: BUSES_PROHIBITED,
    [MAIN_TYPE.CARS_PROHIBITED]: CARS_PROHIBITED,
    [MAIN_TYPE.CARS_TRAILERS_PROHIBITED]: CARS_TRAILERS_PROHIBITED,
    [MAIN_TYPE.TRUCKS_TRAILERS_PROHIBITED]: TRUCKS_TRAILERS_PROHIBITED,
    [MAIN_TYPE.TRACTORS_PROHIBITED]: TRACTORS_PROHIBITED,
    [MAIN_TYPE.PEDESTRIANS_PROHIBITED]: PEDESTRIANS_PROHIBITED,
    [MAIN_TYPE.MOTOR_VEHICLES_PROHIBITED]: MOTOR_VEHICLES_PROHIBITED,
    [MAIN_TYPE.HAZARDOUS_GOODS_VEHICLES_PROHIBITED]: HAZARDOUS_GOODS_VEHICLES_PROHIBITED,
    [MAIN_TYPE.OVER_WEIGHT_VEHICLES_PROHIBITED]: OVER_WEIGHT_VEHICLES_PROHIBITED,
    [MAIN_TYPE.VEHICLES_AXLE_OVER_WEIGHT_PROHIBITED]: VEHICLES_AXLE_OVER_WEIGHT_PROHIBITED,
    [MAIN_TYPE.VEHICLES_EXCESS_WIDTH_PROHIBITED]: VEHICLES_EXCESS_WIDTH_PROHIBITED,
    [MAIN_TYPE.VEHICLES_EXCESS_HEIGHT_PROHIBITED]: VEHICLES_EXCESS_HEIGHT_PROHIBITED,
    [MAIN_TYPE.VEHICLES_EXCESS_LENGTH_PROHIBITED]: VEHICLES_EXCESS_LENGTH_PROHIBITED,
    [MAIN_TYPE.DO_NOT_ENTER]: DO_NOT_ENTER,
    [MAIN_TYPE.SNOW_CHAINS_REQUIRED]: SNOW_CHAINS_REQUIRED,
    [MAIN_TYPE.WATER_POLLUTANT_VEHICLES_PROHIBITED]: WATER_POLLUTANT_VEHICLES_PROHIBITED,
    [MAIN_TYPE.ENVIRONMENTAL_ZONE_BEGIN]: ENVIRONMENTAL_ZONE_BEGIN,
    [MAIN_TYPE.ENVIRONMENTAL_ZONE_END]: ENVIRONMENTAL_ZONE_END,
    [MAIN_TYPE.NO_U_TURN_LEFT]: NO_U_TURN_LEFT,
    [MAIN_TYPE.NO_U_TURN_RIGHT]: NO_U_TURN_RIGHT,
    [MAIN_TYPE.PRESCRIBED_U_TURN_LEFT]: PRESCRIBED_U_TURN_LEFT,
    [MAIN_TYPE.PRESCRIBED_U_TURN_RIGHT]: PRESCRIBED_U_TURN_RIGHT,
    [MAIN_TYPE.MINIMUM_DISTANCE_FOR_TRUCKS]: MINIMUM_DISTANCE_FOR_TRUCKS,
    [MAIN_TYPE.SPEED_LIMIT_BEGIN]: SPEED_LIMIT_BEGIN,
    [MAIN_TYPE.SPEED_LIMIT_ZONE_BEGIN]: SPEED_LIMIT_ZONE_BEGIN,
    [MAIN_TYPE.SPEED_LIMIT_ZONE_END]: SPEED_LIMIT_ZONE_END,
    [MAIN_TYPE.MINIMUM_SPEED_BEGIN]: MINIMUM_SPEED_BEGIN,
    [MAIN_TYPE.OVERTAKING_BAN_BEGIN]: OVERTAKING_BAN_BEGIN,
    [MAIN_TYPE.OVERTAKING_BAN_FOR_TRUCKS_BEGIN]: OVERTAKING_BAN_FOR_TRUCKS_BEGIN,
    [MAIN_TYPE.SPEED_LIMIT_END]: SPEED_LIMIT_END,
    [MAIN_TYPE.MINIMUM_SPEED_END]: MINIMUM_SPEED_END,
    [MAIN_TYPE.OVERTAKING_BAN_END]: OVERTAKING_BAN_END,
    [MAIN_TYPE.OVERTAKING_BAN_FOR_TRUCKS_END]: OVERTAKING_BAN_FOR_TRUCKS_END,
    [MAIN_TYPE.ALL_RESTRICTIONS_END]: ALL_RESTRICTIONS_END,
    [MAIN_TYPE.NO_STOPPING]: NO_STOPPING,
    [MAIN_TYPE.NO_PARKING]: NO_PARKING,
    [MAIN_TYPE.NO_PARKING_ZONE_BEGIN]: NO_PARKING_ZONE_BEGIN,
    [MAIN_TYPE.NO_PARKING_ZONE_END]: NO_PARKING_ZONE_END,
    [MAIN_TYPE.RIGHT_OF_WAY_NEXT_INTERSECTION]: RIGHT_OF_WAY_NEXT_INTERSECTION,
    [MAIN_TYPE.RIGHT_OF_WAY_BEGIN]: RIGHT_OF_WAY_BEGIN,
    [MAIN_TYPE.RIGHT_OF_WAY_END]: RIGHT_OF_WAY_END,
    [MAIN_TYPE.PRIORITY_OVER_OPPOSITE_DIRECTION]: PRIORITY_OVER_OPPOSITE_DIRECTION,
    [MAIN_TYPE.PRIORITY_OVER_OPPOSITE_DIRECTION_UPSIDE_DOWN]:
      PRIORITY_OVER_OPPOSITE_DIRECTION_UPSIDE_DOWN,
    [MAIN_TYPE.TOWN_BEGIN]: TOWN_BEGIN,
    [MAIN_TYPE.TOWN_END]: TOWN_END,
    [MAIN_TYPE.CAR_PARKING]: CAR_PARKING,
    [MAIN_TYPE.CAR_PARKING_ZONE_BEGIN]: CAR_PARKING_ZONE_BEGIN,
    [MAIN_TYPE.CAR_PARKING_ZONE_END]: CAR_PARKING_ZONE_END,
    [MAIN_TYPE.SIDEWALK_HALF_PARKING_LEFT]: SIDEWALK_HALF_PARKING_LEFT,
    [MAIN_TYPE.SIDEWALK_HALF_PARKING_RIGHT]: SIDEWALK_HALF_PARKING_RIGHT,
    [MAIN_TYPE.SIDEWALK_PARKING_LEFT]: SIDEWALK_PARKING_LEFT,
    [MAIN_TYPE.SIDEWALK_PARKING_RIGHT]: SIDEWALK_PARKING_RIGHT,
    [MAIN_TYPE.SIDEWALK_PERPENDICULAR_HALF_PARKING_LEFT]: SIDEWALK_PERPENDICULAR_HALF_PARKING_LEFT,
    [MAIN_TYPE.SIDEWALK_PERPENDICULAR_HALF_PARKING_RIGHT]:
      SIDEWALK_PERPENDICULAR_HALF_PARKING_RIGHT,
    [MAIN_TYPE.SIDEWALK_PERPENDICULAR_PARKING_LEFT]: SIDEWALK_PERPENDICULAR_PARKING_LEFT,
    [MAIN_TYPE.SIDEWALK_PERPENDICULAR_PARKING_RIGHT]: SIDEWALK_PERPENDICULAR_PARKING_RIGHT,
    [MAIN_TYPE.LIVING_STREET_BEGIN]: LIVING_STREET_BEGIN,
    [MAIN_TYPE.LIVING_STREET_END]: LIVING_STREET_END,
    [MAIN_TYPE.TUNNEL]: TUNNEL,
    [MAIN_TYPE.EMERGENCY_STOPPING_LEFT]: EMERGENCY_STOPPING_LEFT,
    [MAIN_TYPE.EMERGENCY_STOPPING_RIGHT]: EMERGENCY_STOPPING_RIGHT,
    [MAIN_TYPE.HIGHWAY_BEGIN]: HIGHWAY_BEGIN,
    [MAIN_TYPE.HIGHWAY_END]: HIGHWAY_END,
    [MAIN_TYPE.EXPRESSWAY_BEGIN]: EXPRESSWAY_BEGIN,
    [MAIN_TYPE.EXPRESSWAY_END]: EXPRESSWAY_END,
    [MAIN_TYPE.NAMED_HIGHWAY_EXIT]: NAMED_HIGHWAY_EXIT,
    [MAIN_TYPE.NAMED_EXPRESSWAY_EXIT]: NAMED_EXPRESSWAY_EXIT,
    [MAIN_TYPE.NAMED_ROAD_EXIT]: NAMED_ROAD_EXIT,
    [MAIN_TYPE.HIGHWAY_EXIT]: HIGHWAY_EXIT,
    [MAIN_TYPE.EXPRESSWAY_EXIT]: EXPRESSWAY_EXIT,
    [MAIN_TYPE.ONEWAY_STREET]: ONEWAY_STREET,
    [MAIN_TYPE.CROSSING_GUARDS]: CROSSING_GUARDS,
    [MAIN_TYPE.DEADEND]: DEADEND,
    [MAIN_TYPE.DEADEND_EXCLUDING_DESIGNATED_ACTORS]: DEADEND_EXCLUDING_DESIGNATED_ACTORS,
    [MAIN_TYPE.FIRST_AID_STATION]: FIRST_AID_STATION,
    [MAIN_TYPE.POLICE_STATION]: POLICE_STATION,
    [MAIN_TYPE.TELEPHONE]: TELEPHONE,
    [MAIN_TYPE.FILLING_STATION]: FILLING_STATION,
    [MAIN_TYPE.HOTEL]: HOTEL,
    [MAIN_TYPE.INN]: INN,
    [MAIN_TYPE.KIOSK]: KIOSK,
    [MAIN_TYPE.TOILET]: TOILET,
    [MAIN_TYPE.CHAPEL]: CHAPEL,
    [MAIN_TYPE.TOURIST_INFO]: TOURIST_INFO,
    [MAIN_TYPE.REPAIR_SERVICE]: REPAIR_SERVICE,
    [MAIN_TYPE.PEDESTRIAN_UNDERPASS]: PEDESTRIAN_UNDERPASS,
    [MAIN_TYPE.PEDESTRIAN_BRIDGE]: PEDESTRIAN_BRIDGE,
    [MAIN_TYPE.CAMPER_PLACE]: CAMPER_PLACE,
    [MAIN_TYPE.ADVISORY_SPEED_LIMIT_BEGIN]: ADVISORY_SPEED_LIMIT_BEGIN,
    [MAIN_TYPE.ADVISORY_SPEED_LIMIT_END]: ADVISORY_SPEED_LIMIT_END,
    [MAIN_TYPE.PLACE_NAME]: PLACE_NAME,
    [MAIN_TYPE.TOURIST_ATTRACTION]: TOURIST_ATTRACTION,
    [MAIN_TYPE.TOURIST_ROUTE]: TOURIST_ROUTE,
    [MAIN_TYPE.TOURIST_AREA]: TOURIST_AREA,
    [MAIN_TYPE.SHOULDER_NOT_PASSABLE_MOTOR_VEHICLES]: SHOULDER_NOT_PASSABLE_MOTOR_VEHICLES,
    [MAIN_TYPE.SHOULDER_UNSAFE_TRUCKS_TRACTORS]: SHOULDER_UNSAFE_TRUCKS_TRACTORS,
    [MAIN_TYPE.TOLL_BEGIN]: TOLL_BEGIN,
    [MAIN_TYPE.TOLL_END]: TOLL_END,
    [MAIN_TYPE.TOLL_ROAD]: TOLL_ROAD,
    [MAIN_TYPE.CUSTOMS]: CUSTOMS,
    [MAIN_TYPE.INTERNATIONAL_BORDER_INFO]: INTERNATIONAL_BORDER_INFO,
    [MAIN_TYPE.STREETLIGHT_RED_BAND]: STREETLIGHT_RED_BAND,
    [MAIN_TYPE.FEDERAL_HIGHWAY_ROUTE_NUMBER]: FEDERAL_HIGHWAY_ROUTE_NUMBER,
    [MAIN_TYPE.HIGHWAY_ROUTE_NUMBER]: HIGHWAY_ROUTE_NUMBER,
    [MAIN_TYPE.HIGHWAY_INTERCHANGE_NUMBER]: HIGHWAY_INTERCHANGE_NUMBER,
    [MAIN_TYPE.EUROPEAN_ROUTE_NUMBER]: EUROPEAN_ROUTE_NUMBER,
    [MAIN_TYPE.FEDERAL_HIGHWAY_DIRECTION_LEFT]: FEDERAL_HIGHWAY_DIRECTION_LEFT,
    [MAIN_TYPE.FEDERAL_HIGHWAY_DIRECTION_RIGHT]: FEDERAL_HIGHWAY_DIRECTION_RIGHT,
    [MAIN_TYPE.PRIMARY_ROAD_DIRECTION_LEFT]: PRIMARY_ROAD_DIRECTION_LEFT,
    [MAIN_TYPE.PRIMARY_ROAD_DIRECTION_RIGHT]: PRIMARY_ROAD_DIRECTION_RIGHT,
    [MAIN_TYPE.SECONDARY_ROAD_DIRECTION_LEFT]: SECONDARY_ROAD_DIRECTION_LEFT,
    [MAIN_TYPE.SECONDARY_ROAD_DIRECTION_RIGHT]: SECONDARY_ROAD_DIRECTION_RIGHT,
    [MAIN_TYPE.DIRECTION_DESIGNATED_ACTORS_LEFT]: DIRECTION_DESIGNATED_ACTORS_LEFT,
    [MAIN_TYPE.DIRECTION_DESIGNATED_ACTORS_RIGHT]: DIRECTION_DESIGNATED_ACTORS_RIGHT,
    [MAIN_TYPE.ROUTING_DESIGNATED_ACTORS]: ROUTING_DESIGNATED_ACTORS,
    [MAIN_TYPE.DIRECTION_TO_HIGHWAY_LEFT]: DIRECTION_TO_HIGHWAY_LEFT,
    [MAIN_TYPE.DIRECTION_TO_HIGHWAY_RIGHT]: DIRECTION_TO_HIGHWAY_RIGHT,
    [MAIN_TYPE.DIRECTION_TO_LOCAL_DESTINATION_LEFT]: DIRECTION_TO_LOCAL_DESTINATION_LEFT,
    [MAIN_TYPE.DIRECTION_TO_LOCAL_DESTINATION_RIGHT]: DIRECTION_TO_LOCAL_DESTINATION_RIGHT,
    [MAIN_TYPE.CONSOLIDATED_DIRECTIONS]: CONSOLIDATED_DIRECTIONS,
    [MAIN_TYPE.STREET_NAME]: STREET_NAME,
    [MAIN_TYPE.DIRECTION_PREANNOUNCEMENT]: DIRECTION_PREANNOUNCEMENT,
    [MAIN_TYPE.DIRECTION_PREANNOUNCEMENT_LANE_CONFIG]: DIRECTION_PREANNOUNCEMENT_LANE_CONFIG,
    [MAIN_TYPE.DIRECTION_PREANNOUNCEMENT_HIGHWAY_ENTRIES]:
      DIRECTION_PREANNOUNCEMENT_HIGHWAY_ENTRIES,
    [MAIN_TYPE.HIGHWAY_ANNOUNCEMENT]: HIGHWAY_ANNOUNCEMENT,
    [MAIN_TYPE.OTHER_ROAD_ANNOUNCEMENT]: OTHER_ROAD_ANNOUNCEMENT,
    [MAIN_TYPE.HIGHWAY_ANNOUNCEMENT_TRUCK_STOP]: HIGHWAY_ANNOUNCEMENT_TRUCK_STOP,
    [MAIN_TYPE.HIGHWAY_PREANNOUNCEMENT_DIRECTIONS]: HIGHWAY_PREANNOUNCEMENT_DIRECTIONS,
    [MAIN_TYPE.POLE_EXIT]: POLE_EXIT,
    [MAIN_TYPE.HIGHWAY_DISTANCE_BOARD]: HIGHWAY_DISTANCE_BOARD,
    [MAIN_TYPE.DETOUR_LEFT]: DETOUR_LEFT,
    [MAIN_TYPE.DETOUR_RIGHT]: DETOUR_RIGHT,
    [MAIN_TYPE.NUMBERED_DETOUR]: NUMBERED_DETOUR,
    [MAIN_TYPE.DETOUR_BEGIN]: DETOUR_BEGIN,
    [MAIN_TYPE.DETOUR_END]: DETOUR_END,
    [MAIN_TYPE.DETOUR_ROUTING_BOARD]: DETOUR_ROUTING_BOARD,
    [MAIN_TYPE.OPTIONAL_DETOUR]: OPTIONAL_DETOUR,
    [MAIN_TYPE.OPTIONAL_DETOUR_ROUTING]: OPTIONAL_DETOUR_ROUTING,
    [MAIN_TYPE.ROUTE_RECOMMENDATION]: ROUTE_RECOMMENDATION,
    [MAIN_TYPE.ROUTE_RECOMMENDATION_END]: ROUTE_RECOMMENDATION_END,
    [MAIN_TYPE.ANNOUNCE_LANE_TRANSITION_LEFT]: ANNOUNCE_LANE_TRANSITION_LEFT,
    [MAIN_TYPE.ANNOUNCE_LANE_TRANSITION_RIGHT]: ANNOUNCE_LANE_TRANSITION_RIGHT,
    [MAIN_TYPE.ANNOUNCE_RIGHT_LANE_END]: ANNOUNCE_RIGHT_LANE_END,
    [MAIN_TYPE.ANNOUNCE_LEFT_LANE_END]: ANNOUNCE_LEFT_LANE_END,
    [MAIN_TYPE.ANNOUNCE_RIGHT_LANE_BEGIN]: ANNOUNCE_RIGHT_LANE_BEGIN,
    [MAIN_TYPE.ANNOUNCE_LEFT_LANE_BEGIN]: ANNOUNCE_LEFT_LANE_BEGIN,
    [MAIN_TYPE.ANNOUNCE_LANE_CONSOLIDATION]: ANNOUNCE_LANE_CONSOLIDATION,
    [MAIN_TYPE.DETOUR_CITY_BLOCK]: DETOUR_CITY_BLOCK,
    [MAIN_TYPE.GATE]: GATE,
    [MAIN_TYPE.POLE_WARNING]: POLE_WARNING,
    [MAIN_TYPE.TRAFFIC_CONE]: TRAFFIC_CONE,
    [MAIN_TYPE.MOBILE_LANE_CLOSURE]: MOBILE_LANE_CLOSURE,
    [MAIN_TYPE.REFLECTOR_POST]: REFLECTOR_POST,
    [MAIN_TYPE.DIRECTIONAL_BOARD_WARNING]: DIRECTIONAL_BOARD_WARNING,
    [MAIN_TYPE.GUIDING_PLATE]: GUIDING_PLATE,
    [MAIN_TYPE.GUIDING_PLATE_WEDGES]: GUIDING_PLATE_WEDGES,
    [MAIN_TYPE.PARKING_HAZARD]: PARKING_HAZARD,
    [MAIN_TYPE.TRAFFIC_LIGHT_GREEN_ARROW]: TRAFFIC_LIGHT_GREEN_ARROW,
  },
  supplementary: {
    [SUPPLEMENTARY_TYPE.UNKNOWN]: SUP_UNKNOWN,
    [SUPPLEMENTARY_TYPE.OTHER]: SUP_OTHER,
    [SUPPLEMENTARY_TYPE.NO_SIGN]: SUP_NO_SIGN,
    [SUPPLEMENTARY_TYPE.TEXT]: SUP_TEXT,
    [SUPPLEMENTARY_TYPE.SPACE]: SUP_SPACE,
    [SUPPLEMENTARY_TYPE.TIME]: SUP_TIME,
    [SUPPLEMENTARY_TYPE.ARROW]: SUP_ARROW,
    [SUPPLEMENTARY_TYPE.CONSTRAINED_TO]: SUP_CONSTRAINED_TO,
    [SUPPLEMENTARY_TYPE.EXCEPT]: SUP_EXCEPT,
    [SUPPLEMENTARY_TYPE.VALID_FOR_DISTANCE]: SUP_VALID_FOR_DISTANCE,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_BOTTOM_LEFT_FOUR_WAY]: SUP_PRIORITY_ROAD_BOTTOM_LEFT_FOUR_WAY,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_TOP_LEFT_FOUR_WAY]: SUP_PRIORITY_ROAD_TOP_LEFT_FOUR_WAY,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_BOTTOM_LEFT_THREE_WAY_STRAIGHT]:
      SUP_PRIORITY_ROAD_BOTTOM_LEFT_THREE_WAY_STRAIGHT,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_BOTTOM_LEFT_THREE_WAY_SIDEWAYS]:
      SUP_PRIORITY_ROAD_BOTTOM_LEFT_THREE_WAY_SIDEWAYS,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_TOP_LEFT_THREE_WAY_STRAIGHT]:
      SUP_PRIORITY_ROAD_TOP_LEFT_THREE_WAY_STRAIGHT,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_BOTTOM_RIGHT_FOUR_WAY]:
      SUP_PRIORITY_ROAD_BOTTOM_RIGHT_FOUR_WAY,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_TOP_RIGHT_FOUR_WAY]: SUP_PRIORITY_ROAD_TOP_RIGHT_FOUR_WAY,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_BOTTOM_RIGHT_THREE_WAY_STRAIGHT]:
      SUP_PRIORITY_ROAD_BOTTOM_RIGHT_THREE_WAY_STRAIGHT,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_BOTTOM_RIGHT_THREE_WAY_SIDEWAY]:
      SUP_PRIORITY_ROAD_BOTTOM_RIGHT_THREE_WAY_SIDEWAY,
    [SUPPLEMENTARY_TYPE.PRIORITY_ROAD_TOP_RIGHT_THREE_WAY_STRAIGHT]:
      SUP_PRIORITY_ROAD_TOP_RIGHT_THREE_WAY_STRAIGHT,
    [SUPPLEMENTARY_TYPE.VALID_IN_DISTANCE]: SUP_VALID_IN_DISTANCE,
    [SUPPLEMENTARY_TYPE.STOP_IN]: SUP_STOP_IN,
    [SUPPLEMENTARY_TYPE.LEFT_ARROW]: SUP_LEFT_ARROW,
    [SUPPLEMENTARY_TYPE.LEFT_BEND_ARROW]: SUP_LEFT_BEND_ARROW,
    [SUPPLEMENTARY_TYPE.RIGHT_ARROW]: SUP_RIGHT_ARROW,
    [SUPPLEMENTARY_TYPE.RIGHT_BEND_ARROW]: SUP_RIGHT_BEND_ARROW,
    [SUPPLEMENTARY_TYPE.ACCIDENT]: SUP_ACCIDENT,
    [SUPPLEMENTARY_TYPE.SNOW]: SUP_SNOW,
    [SUPPLEMENTARY_TYPE.FOG]: SUP_FOG,
    [SUPPLEMENTARY_TYPE.ROLLING_HIGHWAY_INFORMATION]: SUP_ROLLING_HIGHWAY_INFORMATION,
    [SUPPLEMENTARY_TYPE.SERVICES]: SUP_SERVICES,
    [SUPPLEMENTARY_TYPE.TIME_RANGE]: SUP_TIME_RANGE,
    [SUPPLEMENTARY_TYPE.PARKING_DISC_TIME_RESTRICTION]: SUP_PARKING_DISC_TIME_RESTRICTION,
    [SUPPLEMENTARY_TYPE.WEIGHT]: SUP_WEIGHT,
    [SUPPLEMENTARY_TYPE.WET]: SUP_WET,
    [SUPPLEMENTARY_TYPE.PARKING_CONSTRAINT]: SUP_PARKING_CONSTRAINT,
    [SUPPLEMENTARY_TYPE.NO_WAITING_SIDE_STRIPES]: SUP_NO_WAITING_SIDE_STRIPES,
    [SUPPLEMENTARY_TYPE.RAIN]: SUP_RAIN,
    [SUPPLEMENTARY_TYPE.SNOW_RAIN]: SUP_SNOW_RAIN,
    [SUPPLEMENTARY_TYPE.NIGHT]: SUP_NIGHT,
    [SUPPLEMENTARY_TYPE.STOP_4_WAY]: SUP_STOP_4_WAY,
    [SUPPLEMENTARY_TYPE.TRUCK]: SUP_TRUCK,
    [SUPPLEMENTARY_TYPE.TRACTORS_MAY_BE_PASSED]: SUP_TRACTORS_MAY_BE_PASSED,
    [SUPPLEMENTARY_TYPE.HAZARDOUS]: SUP_HAZARDOUS,
    [SUPPLEMENTARY_TYPE.TRAILER]: SUP_TRAILER,
    [SUPPLEMENTARY_TYPE.ZONE]: SUP_ZONE,
    [SUPPLEMENTARY_TYPE.MOTORCYCLE]: SUP_MOTORCYCLE,
    [SUPPLEMENTARY_TYPE.MOTORCYCLE_ALLOWED]: SUP_MOTORCYCLE_ALLOWED,
    [SUPPLEMENTARY_TYPE.CAR]: SUP_CAR,
  },
};
