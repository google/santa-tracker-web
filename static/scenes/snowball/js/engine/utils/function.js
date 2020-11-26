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

export const combine = (...fns) => (...args) => fns.forEach(fn => fn(...args));
export const randomElement = array => array[Math.floor(Math.random() * array.length)];
export const randomValue = object => {
  const keys = Object.keys(object);
  return object[keys[Math.floor(Math.random() * keys.length)]];
};
