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
 * Briefing Slidehow constants
 *
 * @const
 */
app.Constants = {

  SLIDE_SIZE: 393,

  RANDOM_DELAY_POOL_MS: [
    3504,
    7008,
    10512,
    14016,
    17520,
    21024
  ],

  LAST_SLIDE_INDEX: 3,

  // Duration for when the door opens
  ELEVATOR_UNTIL_DOOR_OPENS_MS: 2000,
  ELEVATOR_DOOR_OPENED_MS: 2200,
  ELEVATOR_UNTIL_DOOR_CLOSES_MS: 5000,

  // Note: this MUST match the total duration
  // of its child elements keyframes animations
  ELEVATOR_ANIMATION_DURATION_MS: 8000,

  SCREEN_SLIDE_DURATION_MS: 2000,

  SCREEN_SLIDE_CYCLE_MS: 7000,

  SLEEPING_ELVES_LIMIT: 3,

  CLASS_INCOMING_ELEVATOR: 'elevator--incoming',
  CLASS_OPENED_ELEVATOR: 'elevator--opened',
  CLASS_ACTIVE_BUTTON: 'elevator__panel__button--active',
  CLASS_ACTIVE_CHARACTER: 'elevator__character--active',

  LAST_SET_INDEX: 3,
  NUM_OF_CHARACTERS: 3

};
