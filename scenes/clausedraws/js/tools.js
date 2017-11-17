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

goog.provide('app.Tools');
goog.require('app.Eraser');
goog.require('app.LayerTool');
goog.require('app.Marker');
goog.require('app.PaintRoller');
goog.require('app.Pencil');
goog.require('app.Shape');
goog.require('app.SprayColor');
goog.require('app.SprinkleSpray');
goog.require('app.Stamp');
goog.require('app.Sticker');
goog.require('app.TextureDrawer');
goog.require('app.EffectInvert');
goog.require('app.Tool');
goog.require('app.utils');
goog.require('app.shared.utils');


/**
 * The toolbox
 * @param {!app.Game} game
 * @param {!jQuery} $elem
 * @constructor
 */
app.Tools = function(game, $elem) {
  this.game_ = game;

  this.sliders = $('[data-slider]', $elem);
  this.rotators = $('[data-rotator]', $elem);

  this.primaryMenu = $elem.find('.Tools--primary');
  this.categoryPickers = this.primaryMenu.find('[data-tool-category-picker]');

  this.secondaryMenu = $elem.find('.Tools--secondary');
  this.categoryMenus = this.secondaryMenu.find('[data-tool-category-menu]');
  this.categoryMenuNavs = this.categoryMenus.find('[data-tool-category-nav]');
  this.categoryMenuNavBtns = this.categoryMenuNavs.find('[data-tool-nav]');

  this.subcategoryPickers = this.categoryMenus.find('[data-tool-subcategory-picker]');
  this.subcategoryMenus = this.categoryMenus.find('[data-tool-subcategory-menu]');

  this.tertiaryMenu = $elem.find('.Tools--tertiary');

  this.categoryPickers.on('click.clausedraws touchend.clausedraws', this.onCategoryClick_.bind(this));
  this.subcategoryPickers.on('click.clausedraws touchend.clausedraws', this.onSubcategoryClick_.bind(this));
  this.categoryMenuNavBtns.on('click.clausedraws touchend.clausedraws', this.onNavClick_.bind(this));

  this.pencil = new app.TextureDrawer($elem, 'pencil', {
      opacity: 0.5,
      drawFrequency: 2,
      sizeConfig: {
        min: app.Constants.PENCIL_MIN,
        max: app.Constants.PENCIL_MAX
      }
    });
  this.crayon = new app.TextureDrawer($elem, 'crayon');
  this.marker = new app.Marker($elem, 'marker');
  this.paintbrush = new app.TextureDrawer($elem, 'paintbrush', { opacity: 0.5 });
  this.tinsel = new app.TextureDrawer($elem, 'tinsel', {
      sizeConfig: {
        min: app.Constants.TINSEL_MIN,
        max: app.Constants.TINSEL_MAX,
        scale: true
      },
      monotone: true
    });

  this.spray = new app.SprayColor($elem, 'spray-color');
  this.sprinkles = new app.SprinkleSpray($elem, 'spray-sprinkles');
  this.sceneAir = new app.LayerTool($elem, 'air', app.LayerTool.Layer.BACKGROUND);
  this.sceneAirport = new app.LayerTool($elem, 'airport', app.LayerTool.Layer.BACKGROUND);
  this.sceneBeach = new app.LayerTool($elem, 'beach', app.LayerTool.Layer.BACKGROUND);
  this.sceneDock = new app.LayerTool($elem, 'dock', app.LayerTool.Layer.BACKGROUND);
  this.sceneIceberg = new app.LayerTool($elem, 'iceberg', app.LayerTool.Layer.BACKGROUND);
  this.sceneLivingroom = new app.LayerTool($elem, 'livingroom', app.LayerTool.Layer.BACKGROUND);
  this.sceneNight = new app.LayerTool($elem, 'night', app.LayerTool.Layer.BACKGROUND);
  this.sceneSnow = new app.LayerTool($elem, 'snow', app.LayerTool.Layer.BACKGROUND);
  this.sceneUnderwater = new app.LayerTool($elem, 'underwater', app.LayerTool.Layer.BACKGROUND);
  this.eraser = new app.Eraser($elem, 'eraser');
  this.shapeCircle = new app.Shape($elem, 'circle');
  this.shapeDiamond = new app.Shape($elem, 'diamond');
  this.shapeHeart = new app.Shape($elem, 'heart');
  this.shapeOctagon = new app.Shape($elem, 'octagon');
  this.shapePentagon = new app.Shape($elem, 'pentagon');
  this.shapeRectangle = new app.Shape($elem, 'rectangle');
  this.shapeSquare = new app.Shape($elem, 'square');
  this.shapeStar = new app.Shape($elem, 'star');
  this.shapeTriangle = new app.Shape($elem, 'triangle');
  this.stampBow = new app.Stamp($elem, 'bow');
  this.stampPresent = new app.Stamp($elem, 'present');
  this.stampOrnamentRound1 = new app.Stamp($elem, 'ornament-round1');
  this.stampOrnamentRound2 = new app.Stamp($elem, 'ornament-round2');
  this.stampOrnamentRound3 = new app.Stamp($elem, 'ornament-round3');
  this.stampOrnamentSkinny1 = new app.Stamp($elem, 'ornament-skinny1');
  this.stampOrnamentSkinny2 = new app.Stamp($elem, 'ornament-skinny2');
  this.stampOrnamentWide1 = new app.Stamp($elem, 'ornament-wide1');
  this.stampOrnamentWide2 = new app.Stamp($elem, 'ornament-wide2');
  this.stampCandyGumdrop = new app.Stamp($elem, 'candy-gumdrop');
  this.stampCandyJellybean = new app.Stamp($elem, 'candy-jellybean');
  this.stampCandyMintSwirl = new app.Stamp($elem, 'candy-mint-swirl');
  this.stampCandyMintWheel = new app.Stamp($elem, 'candy-mint-wheel');
  this.stampCandySucker = new app.Stamp($elem, 'candy-sucker');
  this.stampCandyWrapper1 = new app.Stamp($elem, 'candy-wrapper1');
  this.stampCandyWrapper2 = new app.Stamp($elem, 'candy-wrapper2');
  this.rollerCheckered = new app.PaintRoller($elem, 'checkered');
  this.rollerDiagonal = new app.PaintRoller($elem, 'diagonal');
  this.rollerHorizontal = new app.PaintRoller($elem, 'horizontal');
  this.rollerPolkadots = new app.PaintRoller($elem, 'polkadots');
  this.rollerSnowflakes = new app.PaintRoller($elem, 'snowflakes');
  this.rollerTrees = new app.PaintRoller($elem, 'trees');
  this.rollerVertical = new app.PaintRoller($elem, 'vertical');
  this.effectInvert = new app.EffectInvert($elem, 'effect-invert');
  this.stickerDinosaur = new app.Sticker($elem, 'dinosaur');
  this.stickerFishTeal = new app.Sticker($elem, 'fish-teal');
  this.stickerSanta = new app.Sticker($elem, 'santa');
  this.stickerCactus = new app.Sticker($elem, 'cactus');
  this.stickerIgloo = new app.Sticker($elem, 'igloo');
  this.stickerTreePalm = new app.Sticker($elem, 'tree-palm');

  this.tools = [
    this.pencil,
    this.crayon,
    this.marker,
    this.paintbrush,
    this.tinsel,
    this.spray,
    this.sprinkles,
    this.sceneAir,
    this.sceneAirport,
    this.sceneBeach,
    this.sceneDock,
    this.sceneIceberg,
    this.sceneLivingroom,
    this.sceneNight,
    this.sceneSnow,
    this.sceneUnderwater,
    this.eraser,
    this.shapeCircle,
    this.shapeDiamond,
    this.shapeHeart,
    this.shapeOctagon,
    this.shapePentagon,
    this.shapeRectangle,
    this.shapeSquare,
    this.shapeStar,
    this.shapeTriangle,
    this.stampBow,
    this.stampPresent,
    this.stampOrnamentRound1,
    this.stampOrnamentRound2,
    this.stampOrnamentRound3,
    this.stampOrnamentSkinny1,
    this.stampOrnamentSkinny2,
    this.stampOrnamentWide1,
    this.stampOrnamentWide2,
    this.stampCandyGumdrop,
    this.stampCandyJellybean,
    this.stampCandyMintSwirl,
    this.stampCandyMintWheel,
    this.stampCandySucker,
    this.stampCandyWrapper1,
    this.stampCandyWrapper2,
    this.rollerCheckered,
    this.rollerDiagonal,
    this.rollerHorizontal,
    this.rollerPolkadots,
    this.rollerSnowflakes,
    this.rollerTrees,
    this.rollerVertical,
    this.effectInvert,
    this.stickerDinosaur,
    this.stickerFishTeal,
    this.stickerSanta,
    this.stickerCactus,
    this.stickerIgloo,
    this.stickerTreePalm
  ];
};


/**
 * Starts the tools
 */
app.Tools.prototype.start = function() {
  this.selectTool_ = this.selectTool_.bind(this);
  this.secondaryMenu.on('click.clausedraws touchend.clausedraws',
      this.selectTool_);

  this.onResize();
  $(window).on('resize.clausedraws', this.onResize.bind(this));
};


/**
 * Mouse changed handler
 * @param {!app.Mouse} mouse
 * @param {app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Tools.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (this.selectedTool) {
    this.selectedTool.move(mouseCoords);

    if (mouseCoords.down) {
      this.selectedTool.startMousedown();

      if (this.secondaryMenuActive && !app.shared.utils.touchEnabled &&
          this.game_.mouse.isInsideEl(mouseCoords.x, mouseCoords.y, this.game_.canvas.displayCanvas)) {
        this.secondaryMenu.removeClass('is-active');
      }
    } else {
      this.selectedTool.stopMousedown();

      if (!app.shared.utils.touchEnabled && this.secondaryMenuActive) {
        this.secondaryMenu.addClass('is-active');
      }
    }
  }
};


/**
 * Handle clicks on the toolbox to select a tool
 * @param {!Event} e DOM click event
 * @private
 */
app.Tools.prototype.selectTool_ = function(e) {
  // Check if on slider or rotator
  if ($(e.target).closest('[data-slider]').length ||
    $(e.target).closest('[data-rotator]').length) {
    return;
  }

  var previousTool = this.selectedTool;

  if (previousTool) {
    previousTool.deselect();
  }

  this.selectedTool = this.tools.filter(function(tool) {
    var target = $(e.target).closest('[data-tool]');
    if (tool.el[0] === target[0] && !tool.isSelected) {
      return tool;
    }
  })[0];

  if (this.selectedTool) {
    if (app.LayerTool.prototype.isPrototypeOf(this.selectedTool)) {
      this.selectedTool.draw();
      this.selectedTool = null;
    } else if (app.EffectInvert.prototype.isPrototypeOf(this.selectedTool)) {
      this.drawToCanvas(this.selectedTool);
      this.selectedTool = null;
    } else {
      if (this.selectedTool != previousTool) {
        var coords = this.game_.mouse.coordinates();
        this.selectedTool.preloadColor(this.game_.colorpicker.selectedColor);
        this.selectedTool.select(coords);
        this.sliderChanged(this.game_.slider.size);
      } else {
        this.selectedTool = null;
      }
    }

    if (app.shared.utils.touchEnabled) {
      this.secondaryMenu.removeClass('is-active');
    }
  }
};


app.Tools.prototype.drawToCanvas = function(selectedTool) {
  this.game_.canvas.updateCanvas(selectedTool, selectedTool.draw);
  this.game_.canvas.save();
  this.game_.canvas.needSave = false;
};


app.Tools.prototype.onCategoryClick_ = function(e) {
  var categoryPicker = $(e.target).closest('[data-tool-category-picker]');
  var categoryName = categoryPicker.attr('data-tool-category');
  var categoryMenu = this.secondaryMenu.find('[data-tool-category="' + categoryName + '"]');

  if (this.currentCategory && this.currentCategory == categoryName) {
    if (app.shared.utils.touchEnabled) {
      if (this.secondaryMenuActive) {
        if (!this.selectedTool) {
          categoryPicker.toggleClass('is-active');
        }
        this.secondaryMenu.toggleClass('is-active');
      }

      if (categoryName == 'eraser') {
        categoryPicker.removeClass('is-active');
        this.currentCategory = null;
        this.selectedTool.deselect();
        this.selectedTool = null;
      }
    }

    return;
  }

  this.categoryPickers.removeClass('is-active');
  this.categoryMenus.removeClass('is-active');
  categoryPicker.addClass('is-active');
  this.currentCategory = categoryName;

  if (this.selectedTool) {
    this.selectedTool.deselect();
    this.selectedTool = null;
  }

  if (categoryName == 'eraser') {
    this.secondaryMenuActive = false;
    this.secondaryMenu.removeClass('is-active');
    this.selectTool_(e);
  } else {
    this.secondaryMenuActive = true;
    this.secondaryMenu.addClass('is-active');
    categoryMenu.addClass('is-active');
  }
};


app.Tools.prototype.onSubcategoryClick_ = function(e) {
  var subcategoryPicker = $(e.target).closest('[data-tool-subcategory-picker]');
  var subcategoryName = subcategoryPicker.attr('data-tool-subcategory');
  var subcategoryMenu = this.secondaryMenu.find('[data-tool-subcategory="' + subcategoryName + '"]');

  this.subcategoryPickers.removeClass('is-active');
  this.subcategoryMenus.removeClass('is-active');
  subcategoryMenu.addClass('is-active');
  subcategoryPicker.addClass('is-active');

  this.onResize();
};


app.Tools.prototype.sliderChanged = function(size) {
  if (this.selectedTool) {
    this.selectedTool.updateSize(size);
    this.circleSize = this.selectedTool.currentSize *
        this.game_.canvas.canvasRatio;

    this.selectedTool.circleEl.css({
      height: this.circleSize,
      width: this.circleSize
    });

    this.selectedTool.mouseOffset = {
      x: -this.circleSize / 2,
      y: this.circleSize / 2
    };
  }
};


app.Tools.prototype.rotatorChanged = function(angle) {
  if (this.selectedTool) {
    this.selectedTool.updateAngle(angle);
  }
};


app.Tools.prototype.colorChanged = function(color) {
  if (this.selectedTool) {
    this.selectedTool.preloadColor(color);
  }
};


app.Tools.prototype.onNavClick_ = function(e) {
  var menu = $(e.target).closest('[data-tool-category-menu]');
  var direction = $(e.target).attr('data-tool-nav') === 'next' ? 1 : -1;
  var offset = direction * 130; // width of 1 tool

  menu.animate({
    scrollLeft: menu.scrollLeft() + offset
  }, 300);
};


app.Tools.prototype.onResize = function() {
  var outerWidth = this.secondaryMenu[0].getBoundingClientRect().width;

  this.categoryMenuNavs.each(function() {
    var menu = $(this).closest('[data-tool-category-menu]');
    if (menu[0] && menu[0].scrollWidth > outerWidth) {
      $(this).addClass('is-active');
    } else {
      $(this).removeClass('is-active');
    }
  });
};
