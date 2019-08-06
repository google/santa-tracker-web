/*
 * Copyright 2016 Google Inc. All rights reserved.
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
 * @enum {Object}
 */
app.Step = {
  IDLE_1: {
    key: 'IDLE_1',
    back: 'idle_1'
  },
  IDLE_2: {
    key: 'IDLE_2',
    back: 'idle_2'
  },
  FAIL: {
    key: 'FAIL',
    back: 'fail'
  },
  WRAP_BLUE: {
    color: 'blue',
    key: 'WRAP_BLUE',
    back: 'wrap_back_blue',
    front: 'wrap_front_blue'
  },
  WRAP_GREEN: {
    color: 'green',
    key: 'WRAP_GREEN',
    back: 'wrap_back_green',
    front: 'wrap_front_green'
  },
  WRAP_RED: {
    color: 'red',
    key: 'WRAP_RED',
    back: 'wrap_back_red',
    front: 'wrap_front_red'
  },
};
