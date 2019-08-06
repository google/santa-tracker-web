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

var fs = require('fs');
var lines = fs.readFileSync('info.txt').toString().split("\n");

let output = {};

lines.forEach(line => {
  if (!line) return;

  let [key, value] = line.split(' ');
  let [width, height, offsetX, offsetY] = value.split(/[x+]+/);

  output[key] = {width, height, offsetX, offsetY}
})

console.log(JSON.stringify(output));





