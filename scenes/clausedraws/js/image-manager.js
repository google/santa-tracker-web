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

goog.provide('app.ImageManager');
goog.require('app.Constants');
goog.require('app.ImageItemBow');
goog.require('app.ImageItemPresent');
goog.require('app.ImageTextureCrayon');
goog.require('app.ImageTexturePaintbrush');
goog.require('app.ImageTexturePencil');
goog.require('app.ImageTextureSpray');



app.ImageManager = function() {
  return {
    getImage: function(key, color, callback) {
      return this.images[key].getImage(color, callback);
    },

    getImageDimensions: function(key) {
      return {
        width: this.images[key].width,
        height: this.images[key].height
      }
    },

    images: {
      "image-bow": new app.ImageItemBow(),
      "image-present": new app.ImageItemPresent(),
      "texture-pencil": new app.ImageTexturePencil(),
      "texture-crayon": new app.ImageTextureCrayon(),
      "texture-paintbrush": new app.ImageTexturePaintbrush(),
      "texture-spray-color": new app.ImageTextureSpray()
    }
  };
}();
