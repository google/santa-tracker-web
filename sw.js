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

/**
 * @fileoverview Service Worker for Santa Tracker.
 */

const version = '';
const contentsPath = 'contents.js';
const staticPath = './STATIC_PATH/';

const query = new URL(self.location).searchParams;

try {
  self.importScripts(contentsPath);  // as this link changes, the SW changes
} catch (e) {
  console.warn('sw contents manifest unavailable');
  throw e;
}

console.debug('manifest at', contents.version, 'loaded from', contentsPath, 'in lang', query.lang);

// TODO(plegner): Service Worker code.
