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

window.SANTA_CONFIG = window.SANTA_CONFIG || {
  "CLIENT_ID": location.host.match("santatracker.google.com") ? "google-santa-tracker" : null,
  "COUNTDOWN_END_DATE": 1450951200000, // Thu Dec 24 2015 02:00:00 GMT-0800 (PST)
  "FLIGHT_FINISHED": 1450951200000 + 25 * 60 * 60 * 1000
};
