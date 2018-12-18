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

goog.provide('app.Step');

/**
 * Dance step constants.
 * @enum {string}
 */
app.Step = {
  LEFT_ARM: 'pointLeft',
  RIGHT_ARM: 'pointRight',
  LEFT_FOOT: 'stepLeft',
  RIGHT_FOOT: 'stepRight',
  JUMP: 'jump',
  SPLIT: 'splits',
  SHAKE: 'hip',

  // Special moves
  FLOSS: 'floss',
  HIPHOP: 'hiphop',
  MCHAMMER: 'mchammer',
  PONY: 'pony',

  // Non blockly moves
  IDLE: 'idle',
  FAIL: 'fail',
  WATCH: 'watch'
};
