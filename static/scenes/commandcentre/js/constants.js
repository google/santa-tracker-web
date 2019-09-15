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
  DEFAULT_SCREEN: 'map',

  PRESENTS_SCREEN_SELECTOR: '.presents-screen',
  PRESENTS_PRELOAD_AMOUNT: 6, // items to preload on belt
  PRESENTS_BELT_DURATION: 12, // s
  PRESENTS_ROTATION_DURATION: 0.6, // s
  PRESENTS_DROP_DURATION: 0.6,  // s
  PRESENTS_MARGIN_MIN: 50,    // px
  PRESENTS_MARGIN_MAX: 100,   // px
  PRESENTS_DROP_ROTATION_MIN: 140, // deg
  PRESENTS_DROP_ROTATION_MAX: 180, // deg

  SLEIGH_SCREEN_SELECTOR: '.sleigh-screen',
  SLEIGH_SHIMMER_DELAY_MIN: 3000,
  SLEIGH_SHIMMER_DELAY_MAX: 9000,
  SLEIGH_HAMMER_DELAY_MIN: 100,
  SLEIGH_HAMMER_DELAY_MAX: 1000
};
