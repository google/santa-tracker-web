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
goog.provide('Constants');


/**
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
app.Constants = {
  // Number of rounds in a game
  TOTAL_LEVELS: 4,
  // Duration of game in seconds
  INITIAL_COUNTDOWN: 30,
  COUNTDOWN_FLASH: 10,
  HANDWRITING_URL: "https://handwriting.googleapis.com/v1beta1/labeledInks:recognizeInks?key=AIzaSyDH0ZhfpNC39Bx_7Z8s9KFNprToZbNP88A",
  HANDWRITING_THRESHOLD: 4.0,
  HANDWRITING_RECOGNITION_THRESHOLD: 2.0,
  // Max allowed rate recognition api can be called in seconds
  MAX_API_RATE: 1.0,
  WORDS: ["holiday lights", "stocking", "chimney", "sleigh", "ribbon",
      "mistletoe", "mug", "tree", "snowflake", "candy cane", "ornament",
      "cookie", "jetpack", "skier", "santa", "star", "snowman", "reindeer",
      "nutcracker", "present", "campfire", "penguin", "ice skater",
      "jingle bells", "mittens", "gingerbread man", "wreath",
      "candy", "elf", "peppermint", "sweater"]
};


Constants = app.Constants;
