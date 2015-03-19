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
 * Scene constants
 * @const
*/
app.Constants = {
  START_DELAY_MS: 500,

  ROTATE_INTERVAL: 1000 / 60, // ms between frames
  ROTATE_DISTANCE: 0.2, //degrees per frame

  STATIC_DOMAIN: 'https://maps.googleapis.com/maps/api/streetview',
  STATIC_QS: '?size=620x400&fov=[FOV]&heading=[HEADING]&pitch=[PITCH]&pano=[ID]&sensor=false',

  POSITION_OFFSET: {
    'left': 0,
    'middle': 1,
    'right': 2
  },

  EASE_IN_QUINT: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
  EASE_IN_OUT_CIRC: 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',

  PANORMA_DEFAULT_FOV: 90,

  PANORAMA_OPTIONS: {
    disableDefaultUI: false,
    addressControl: false,
    panControl: false,
    linksControl: false,
    imageDateControl: false,
    zoomControl: false
  }

};
