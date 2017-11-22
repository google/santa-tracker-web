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
'use strict';

goog.provide('app.GameAPI');
goog.require('app.Constants');


app.GameAPI = function() {
};

app.GameAPI.prototype.fetchGallery = function(word) {
  return $.ajax({
    method: 'post',
    url: app.Constants.GAME_API_URL,
    dataType: 'json',
    data: {
        method: 'gallery',
        word: word,
        locale: this.getLocale()
    }
  })
  .fail(function(err) {
    throw new Error("Could not fetch new gallery from server", err);
  })
  .done(function() {
    if (!data.images) {
      throw new Error("Could not fetch new gallery from server", err);
    } else {
      console.log(data.images);
    }
  });
};

app.GameAPI.prototype.getLocale = function() {
  return window.document.getElementsByTagName("html")[0].lang.replace("-", "_");
};
