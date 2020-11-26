#!/usr/bin/env python
# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


import re
import sys
import os

x = re.compile('/title>(.+)<')
root = sys.argv[1]
files = os.listdir(root)
files.sort()
for fp in files:
    with open(root + '/' + fp) as f:
        raw = f.read()
        y = x.search(raw)
        match = y and y.group(1) or ''
        if not match:
            continue
        match = match.replace('/>', '/>\n')
        print("""  svg`
{}`,  // {}""".format(match, fp))

