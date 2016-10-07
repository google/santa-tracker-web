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

goog.provide('app.Constants');
goog.provide('Constants');

/**
 * Gameplay constants
 * @const
 */
app.Constants = {
	INITIAL_COUNTDOWN: 60,
	COUNTDOWN_TRACK_LENGTH: 60,
	COUNTDOWN_FLASH: 10,
	SNOWFLAKE_COUNT : 12,
	SNOWFLAKE_ROTATION : 60,
	SNOWFLAKE_SPEED_MIN : 7.5,
	SNOWFLAKE_SPEED_MAX : 20,
	SNOWFLAKE_SHIMMY_MIN : 8,
	SNOWFLAKE_SHIMMY_MAX : 30,
	SNOWFLAKE_SIZE_MIN : 8,
	SNOWFLAKE_SIZE_MAX : 30,
};


// Hack to support shared scoreboard with other apps.
Constants = app.Constants;
