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
goog.require('app.ImageItemCandyGumdrop');
goog.require('app.ImageItemCandyJellybean');
goog.require('app.ImageItemCandyMintSwirl');
goog.require('app.ImageItemCandyMintWheel');
goog.require('app.ImageItemCandySprinkle');
goog.require('app.ImageItemCandySprinkleLeaf');
goog.require('app.ImageItemCandySprinkleRound');
goog.require('app.ImageItemCandySprinkleTree');
goog.require('app.ImageItemCandySucker');
goog.require('app.ImageItemCandyWrapper1');
goog.require('app.ImageItemCandyWrapper2');
goog.require('app.ImageItemConfettiCurve');
goog.require('app.ImageItemConfettiTriangle');
goog.require('app.ImageItemConfettiCircle');
goog.require('app.ImageItemConfettiOutlinedCircle');
goog.require('app.ImageItemConfettiSquiggle');
goog.require('app.ImageItemOrnamentRound1');
goog.require('app.ImageItemOrnamentRound2');
goog.require('app.ImageItemOrnamentRound3');
goog.require('app.ImageItemOrnamentSkinny1');
goog.require('app.ImageItemOrnamentSkinny2');
goog.require('app.ImageItemOrnamentWide1');
goog.require('app.ImageItemOrnamentWide2');
goog.require('app.ImageItemOrnamentWide3');
goog.require('app.ImageItemPresent');
goog.require('app.ImageItemStringLight');
goog.require('app.ImageTextureCrayon');
goog.require('app.ImageTexturePaintbrush');
goog.require('app.ImageTexturePencil');
goog.require('app.ImageTextureSpray');
goog.require('app.ImageShapeCircle');
goog.require('app.ImageShapeDiamond');
goog.require('app.ImageShapeHeart');
goog.require('app.ImageShapeOctagon');
goog.require('app.ImageShapePentagon');
goog.require('app.ImageShapeRectangle');
goog.require('app.ImageShapeSquare');
goog.require('app.ImageShapeStar');
goog.require('app.ImageShapeTriangle');



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
      'image-bow': new app.ImageItemBow(),
      'image-present': new app.ImageItemPresent(),
      'image-ornament-round1': new app.ImageItemOrnamentRound1(),
      'image-ornament-round2': new app.ImageItemOrnamentRound2(),
      'image-ornament-round3': new app.ImageItemOrnamentRound3(),
      'image-ornament-skinny1': new app.ImageItemOrnamentSkinny1(),
      'image-ornament-skinny2': new app.ImageItemOrnamentSkinny2(),
      'image-ornament-wide1': new app.ImageItemOrnamentWide1(),
      'image-ornament-wide2': new app.ImageItemOrnamentWide2(),
      'image-ornament-wide3': new app.ImageItemOrnamentWide3(),
      'image-candy-gumdrop': new app.ImageItemCandyGumdrop(),
      'image-candy-jellybean': new app.ImageItemCandyJellybean(),
      'image-candy-mint-swirl': new app.ImageItemCandyMintSwirl(),
      'image-candy-mint-wheel': new app.ImageItemCandyMintWheel(),
      'image-candy-sprinkle': new app.ImageItemCandySprinkle(),
      'image-candy-sprinkle-leaf': new app.ImageItemCandySprinkleLeaf(),
      'image-candy-sprinkle-round': new app.ImageItemCandySprinkleRound(),
      'image-candy-sprinkle-tree': new app.ImageItemCandySprinkleTree(),
      'image-candy-sucker': new app.ImageItemCandySucker(),
      'image-candy-wrapper1': new app.ImageItemCandyWrapper1(),
      'image-candy-wrapper2': new app.ImageItemCandyWrapper2(),
      'image-confetti-curve': new app.ImageItemConfettiCurve(),
      'image-confetti-triangle': new app.ImageItemConfettiTriangle(),
      'image-confetti-circle': new app.ImageItemConfettiCircle(),
      'image-confetti-outlined-circle': new app.ImageItemConfettiOutlinedCircle(),
      'image-confetti-squiggle': new app.ImageItemConfettiSquiggle(),
      'image-string-light': new app.ImageItemStringLight(),
      'texture-pencil': new app.ImageTexturePencil(),
      'texture-crayon': new app.ImageTextureCrayon(),
      'texture-paintbrush': new app.ImageTexturePaintbrush(),
      'texture-spray-color': new app.ImageTextureSpray(),
      'shape-circle': new app.ImageShapeCircle(),
      'shape-diamond': new app.ImageShapeDiamond(),
      'shape-heart': new app.ImageShapeHeart(),
      'shape-octagon': new app.ImageShapeOctagon(),
      'shape-pentagon': new app.ImageShapePentagon(),
      'shape-rectangle': new app.ImageShapeRectangle(),
      'shape-square': new app.ImageShapeSquare(),
      'shape-star': new app.ImageShapeStar(),
      'shape-triangle': new app.ImageShapeTriangle()
    }
  };
}();
