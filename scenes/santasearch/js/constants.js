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
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
app.Constants = {
  ZOOM_MAX: 5,
  SPAWNS: {
    'santa': [
      {
        locationScale: {
          left: 0.16,
          top: 0.725
        },
        sizeScale: {
          width: 0.03603603604,
          height: 0.09770421783
        }
      },
      {
        locationScale: {
          left: 0.47,
          top: 0.615
        },
        sizeScale: {
          width: 0.03603603604,
          height: 0.09770421783
        }
      },
      {
        locationScale: {
          left: 0.87,
          top: 0.23
        },
        sizeScale: {
          width: 0.03603603604,
          height: 0.09770421783
        }
      }
    ],
    'mrs-claus': [
      {
        locationScale: {
          left: 0.19,
          top: 0.7
        },
        sizeScale: {
          width: 0.02290689006,
          height: 0.07816337426
        }
      }
    ]
  }
};
