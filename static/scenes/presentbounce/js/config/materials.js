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


goog.provide('app.config.Materials');

/**
 * Box2D Materials configuration
 * @const
 */
app.config.Materials = {
  snowGlobe: {
    globeDensity: 1,
    plateDensity: 1.5,
    friction: 0.2,
    restitution: 0 // let other surfaces define bounce
  },
  present: {
    density: 1,
    friction: 0.2,
    restitution: 0 // let other surfaces define bounce
  },
  target: {
    density: 1,
    friction: 1, // stop ball
    restitution: 0
  },
  fixedObject: {
    density: 1,
    friction: 0.4,
    restitution: 0.3
  },
  conveyorBelt: {
    density: 1,
    friction: 0.9, // grab onto ball
    restitution: 0.2
  },
  spring: {
    density: 1,
    friction: 1, // dont slide on spring
    restitution: 1.1
  }
};
