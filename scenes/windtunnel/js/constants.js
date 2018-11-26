/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.Constants');

/**
 * Constants for Wind Tunnel scene.
 *
 * @const
 */
app.Constants = {
  FAN_STATE_LOW: 0,
  FAN_STATE_MED: 1,
  FAN_STATE_HIGH: 2,

  FAN_SPEED_CONFIGS: [
    {
      leverAngle: -35,
      indicatorOffset: 15,
      threadClass: 'thread--low',
      parachuteClass: 'parachute-wrap--low',
      windBalloonClass: 'wind-balloon--low',
      soundValue: 0
    },
    {
      leverAngle: 0,
      indicatorOffset: 40,
      threadClass: 'thread--med',
      parachuteClass: 'parachute-wrap--med',
      windBalloonClass: 'wind-balloon--med',
      soundValue: 0.5
    },
    {
      leverAngle: 35,
      indicatorOffset: 75,
      threadClass: 'thread--high',
      parachuteClass: 'parachute-wrap--high',
      windBalloonClass: 'wind-balloon--high',
      soundValue: 1
    }
  ],

  FAN_SPEED_CHANGE_DELAY_MS: 500,

  SNOWBLOWER_SWITCH_CLASSNAMES: [
    'snowblower-switch--low',
    'snowblower-switch--med',
    'snowblower-switch--high'
  ],

  RUDOLF_NORMAL_CLASSNAME: 'rudolf-wrap--normal',
  RUDOLF_SERIOUS_CLASSNAME: 'rudolf-wrap--serious',

  PARACHUTE_ANIMATION_DURATION_MS: 600,
  WIND_BALLOON_ANIMATION_DURATION_MS: 500,

  SCREEN_BACKGROUND_WIDTH: 1870,

  SNOW_CANVAS_WIDTH: 615,
  SNOW_CANVAS_HEIGHT: 490,

  SNOWBLOWER_STATE_OFF: 0,
  SNOWBLOWER_STATE_MED: 1,
  SNOWBLOWER_STATE_HIGH: 2
};
