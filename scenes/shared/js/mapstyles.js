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

var mapstyles = mapstyles || {
  styles: [{
    'stylers': [
      { 'visibility': 'off' }
    ]
  },{
    'featureType': 'water',
    'stylers': [
      { 'visibility': 'on' },
      { 'color': '#69d5d0' }
    ]
  },{
    'featureType': 'landscape',
    'stylers': [
      { 'visibility': 'on' },
      { 'lightness': 110 },
      { 'color': '#dfd7c5' }
    ]
  },{
    'featureType': 'administrative.country',
    'elementType': 'geometry.stroke',
    'stylers': [
      { 'visibility': 'on' },
      { 'invert_lightness': true },
      { 'gamma': 3.75 },
      { 'lightness': 70 },
      { 'weight': 1 }
    ]
  },{
    'featureType': 'landscape.natural',
    'elementType': 'labels',
    'stylers': [
      { 'visibility': 'on' },
      { 'weight': 0.3 },
      { 'invert_lightness': true },
      { 'lightness': 40 }
    ]
  }]
};
