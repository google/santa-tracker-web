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

goog.provide('app.Preloader');
goog.provide('Preloader');


app.Preloader = function(game) {};

app.Preloader.prototype.preload = function() {
  this.load.crossOrigin = 'anonymous';
  this.load.baseURL = 'scenes/penguindash/';  // nb. intentionally relative

  // nb. set asBlob to true for CORS
  this.load.video('background', 'img/wave-bg-slow-big-no-waves.mp4', 'canplaythrough', true);

  this.load.spritesheet('sprite-penguin', 'img/sprite-penguin.png', 153, 108, 32);
  this.load.image('shadow-penguin', 'img/penguin-shadow.png');
  this.load.spritesheet('sprite-dust', 'img/sprite-dust.png', 150, 108, 16);

  this.load.image('element-present1', 'img/element-present1.png');
  this.load.image('element-present2', 'img/element-present2.png');
  this.load.image('element-present3', 'img/element-present3.png');
  this.load.image('element-present4', 'img/element-present4.png');
  this.load.image('element-present5', 'img/element-present5.png');
  this.load.image('element-present6', 'img/element-present6.png');
  this.load.image('element-presentStacked', 'img/element-presentStacked.png');

  this.load.image('element-coal1', 'img/element-coal1.png');
  this.load.image('element-coal2', 'img/element-coal2.png');
  this.load.image('element-coal3', 'img/element-coal3.png');
  this.load.image('element-tree1', 'img/element-tree1.png');
  this.load.image('element-tree2', 'img/element-tree2.png');

  this.load.spritesheet('sprite-duck', 'img/sprite-duck.png', 169, 202, 22);
  this.load.spritesheet('sprite-green_elf', 'img/sprite-green_elf.png', 169, 202, 17);
  this.load.spritesheet('sprite-orange_elf', 'img/sprite-orange_elf.png', 169, 202, 16);
  this.load.spritesheet('sprite-walrus', 'img/sprite-walrus.png', 169, 202, 17);
  this.load.spritesheet('sprite-angels', 'img/sprite-angels.png', 900, 750, 1);
  this.load.spritesheet('sprite-sm_iceberg', 'img/sprite-sm_iceberg.png', 720, 480, 1);
  this.load.spritesheet('sprite-iceberg', 'img/sprite-iceberg.png', 1200, 900, 1);
  this.load.spritesheet('sprite-snowman', 'img/sprite-snowman.png', 736, 616, 1);

  // still image fallback for mobile
  this.load.spritesheet('element-duck', 'img/element-duck.png');
  this.load.spritesheet('element-green_elf', 'img/element-green_elf.png');
  this.load.spritesheet('element-orange_elf', 'img/element-orange_elf.png');
  this.load.spritesheet('element-walrus', 'img/element-walrus.png');
  this.load.spritesheet('element-angels', 'img/element-angels.png');
  this.load.spritesheet('element-sm_iceberg', 'img/element-sm_iceberg.png');
  this.load.spritesheet('element-iceberg', 'img/element-iceberg.png');
  this.load.spritesheet('element-snowman', 'img/element-snowman.png');

  this.load.image('element-snow1', 'img/element-snow1.png');
  this.load.image('element-snow1-shadow', 'img/element-snow1-shadow.png');
  this.load.image('element-snow2', 'img/element-snow2.png');
  this.load.image('element-snow2-shadow', 'img/element-snow2-shadow.png');
  this.load.image('element-snow3', 'img/element-snow3.png');
  this.load.image('element-snow3-shadow', 'img/element-snow3-shadow.png');
  this.load.image('element-snow4', 'img/element-snow4.png');
  this.load.image('element-snow4-shadow', 'img/element-snow4-shadow.png');
  this.load.image('element-snow5', 'img/element-snow5.png');
  this.load.image('element-snow5-shadow', 'img/element-snow5-shadow.png');
  this.load.image('element-ice1', 'img/element-ice1.png');
  this.load.image('element-ice1-shadow', 'img/element-ice1-shadow.png');
  this.load.image('element-ice2', 'img/element-ice2.png');
  this.load.image('element-ice2-shadow', 'img/element-ice2-shadow.png');
  this.load.image('element-ice3', 'img/element-ice3.png');
  this.load.image('element-ice3-shadow', 'img/element-ice3-shadow.png');
  this.load.image('element-ice4', 'img/element-ice4.png');
  this.load.image('element-ice4-shadow', 'img/element-ice4-shadow.png');
  this.load.image('element-ice5', 'img/element-ice5.png');
  this.load.image('element-ice5-shadow', 'img/element-ice5-shadow.png');
  this.load.image('element-finish', 'img/element-finish.png');

  this.load.image('element-start', 'img/element-start.png');
  this.load.image('element-finish', 'img/element-finish.png');
  this.load.image('element-celebrate', 'img/element-celebrate.png');
  this.load.image('element-pole', 'img/element-pole.png');

  this.load.spritesheet('sprite-wave1', 'img/sprite-wave1.png', 250, 100, 41);
  this.load.spritesheet('sprite-wave2', 'img/sprite-wave2.png', 250, 100, 55);
};


app.Preloader.prototype.create = function() {
  this.game.state.start('Game');
};