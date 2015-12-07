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

goog.provide('app.I18n');

/**
 * A simple cache of translations.
 * @type {Object<string>}
 * @private
 */
app.I18n.CACHE_ = {};

/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or an error message if the element was not found.
 */
app.I18n.getMsg = function(key) {
  var msg = app.I18n.getMsgOrNull(key);
  return msg === null ? '[Unknown message: ' + key + ']' : msg;
};

/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or null if the element was not found.
 */
app.I18n.getMsgOrNull = function(key) {
  if (!(key in app.I18n.CACHE_)) {
    var element = document.getElementById(key);
    if (element) {
      var text = element.textContent;
      // Convert newline sequences.
      text = text.replace(/\\n/g, '\n');
      app.I18n.CACHE_[key] = text;
      return text;
    }
  }
  return app.I18n.CACHE_[key];
};
