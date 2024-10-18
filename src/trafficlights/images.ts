import { TrafficLight_Classification_Icon as ICON } from "asam-osi-types";

import ARROW_DIAG_LEFT from "../../assets/images/arrow_diag_left_one.png";
import ARROW_DIAG_RIGHT from "../../assets/images/arrow_diag_right_one.png";
import ARROW_DOWN_LEFT from "../../assets/images/arrow_down_left_one.png";
import ARROW_DOWN from "../../assets/images/arrow_down_one.png";
import ARROW_DOWN_RIGHT from "../../assets/images/arrow_down_right_one.png";
import ARROW_STRAIGHT_AHEAD from "../../assets/images/arrow_forward_one.png";
import ARROW_LEFT from "../../assets/images/arrow_left_one.png";
import ARROW_LEFT_RIGHT from "../../assets/images/arrow_left_right_one.png";
import ARROW_STRAIGHT_AHEAD_LEFT from "../../assets/images/arrow_left_straight_one.png";
import ARROW_RIGHT from "../../assets/images/arrow_right_one.png";
import ARROW_STRAIGHT_AHEAD_RIGHT from "../../assets/images/arrow_right_straight_one.png";
import BICYCLE from "../../assets/images/bicycle_one.png";
import BUS from "../../assets/images/bus.png";
import BUS_AND_TRAM from "../../assets/images/bus_and_tram.png";
import COUNTDOWN_PERCENT from "../../assets/images/countdown_percent.png";
import COUNTDOWN_SECONDS from "../../assets/images/countdown_second.png";
import ARROW_CROSS from "../../assets/images/cross.png";
import DONT_WALK from "../../assets/images/do_not_walk.png";
import NONE from "../../assets/images/normal_one.png";
import PEDESTRIAN_AND_BICYCLE from "../../assets/images/pedestrian_and_bicycle.png";
import PEDESTRIAN from "../../assets/images/pedestrian_one.png";
import TRAM from "../../assets/images/tram.png";
import UNKNOWN from "../../assets/images/unknown.png";
import OTHER from "../../assets/images/unknown.png";
import WALK from "../../assets/images/walk.png";

export default {
  [ICON.UNKNOWN]: UNKNOWN,
  [ICON.OTHER]: OTHER,
  [ICON.NONE]: NONE,
  [ICON.ARROW_STRAIGHT_AHEAD]: ARROW_STRAIGHT_AHEAD,
  [ICON.ARROW_LEFT]: ARROW_LEFT,
  [ICON.ARROW_DIAG_LEFT]: ARROW_DIAG_LEFT,
  [ICON.ARROW_STRAIGHT_AHEAD_LEFT]: ARROW_STRAIGHT_AHEAD_LEFT,
  [ICON.ARROW_RIGHT]: ARROW_RIGHT,
  [ICON.ARROW_DIAG_RIGHT]: ARROW_DIAG_RIGHT,
  [ICON.ARROW_STRAIGHT_AHEAD_RIGHT]: ARROW_STRAIGHT_AHEAD_RIGHT,
  [ICON.ARROW_LEFT_RIGHT]: ARROW_LEFT_RIGHT,
  [ICON.ARROW_DOWN]: ARROW_DOWN,
  [ICON.ARROW_DOWN_LEFT]: ARROW_DOWN_LEFT,
  [ICON.ARROW_DOWN_RIGHT]: ARROW_DOWN_RIGHT,
  [ICON.ARROW_CROSS]: ARROW_CROSS,
  [ICON.PEDESTRIAN]: PEDESTRIAN,
  [ICON.WALK]: WALK,
  [ICON.DONT_WALK]: DONT_WALK,
  [ICON.BICYCLE]: BICYCLE,
  [ICON.PEDESTRIAN_AND_BICYCLE]: PEDESTRIAN_AND_BICYCLE,
  [ICON.COUNTDOWN_SECONDS]: COUNTDOWN_SECONDS,
  [ICON.COUNTDOWN_PERCENT]: COUNTDOWN_PERCENT,
  [ICON.TRAM]: TRAM,
  [ICON.BUS]: BUS,
  [ICON.BUS_AND_TRAM]: BUS_AND_TRAM,
};
