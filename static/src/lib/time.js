/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @param {number} ms to format
 * @return {string}
 */
export function formatDuration(ms) {
  let prefix = '';
  if (ms < 0) {
    prefix = '-';
    ms = -ms;
  }

  const sec = ~~(ms / 1000);
  const min = ~~(sec / 60);
  const hours = ~~(min / 60);
  const days = ~~(hours / 24);

  let out = `${~~(sec - min*60)}s`;
  if (min === 0) {
    return prefix + out;
  }

  out = `${~~(min - hours*60)}m` + out;
  if (hours === 0) {
    return prefix + out;
  }

  out = `${~~(hours - days*24)}h` + out;
  if (days === 0) {
    return prefix + out;
  }

  return `${prefix}${~~days}d${out}`;
}


const msPerDay = 24 * 60 * 60 * 1000;


/**
 * Splits a countdown (in ms) into days, hours, minutes, and seconds. Does not return -ve numbers.
 *
 * @param {number} ms countdown in milliseconds
 * @return {{days: number, hours: number, minutes: number, seconds: number, count: number}}
 */
export function countdownSplit(ms) {
  ms = Math.max(0, ms || 0);

  const daysX = ms / msPerDay;
  const days = Math.floor(daysX);

  const hoursX = (daysX - days) * 24;
  const hours = Math.floor(hoursX);

  const minutesX = (hoursX - hours) * 60;
  const minutes = Math.floor(minutesX);

  const secondsX = (minutesX - minutes) * 60;
  const seconds = Math.floor(secondsX);

  let count = 0;
  if (days) {
    count = 4;
  } else if (hours) {
    count = 3;
  } else if (minutes) {
    count = 2;
  } else if (seconds) {
    count = 1;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    count,
  };
}