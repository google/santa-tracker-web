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
  this.load.video('background', '/scenes/penguindash/img/wave-bg-slow-big-no-waves.mp4');

  this.load.spritesheet('sprite-penguin',
      '/scenes/penguindash/img/sprite-penguin.png', 153, 108, 32);
  this.load.image('shadow-penguin',
      '/scenes/penguindash/img/penguin-shadow.png');
  this.load.spritesheet('sprite-dust',
      '/scenes/penguindash/img/sprite-dust.png', 150, 108, 16);

  this.load.image('element-present1',
      '/scenes/penguindash/img/element-present1.png');
  this.load.image('element-present2',
      '/scenes/penguindash/img/element-present2.png');
  this.load.image('element-present3',
      '/scenes/penguindash/img/element-present3.png');
  this.load.image('element-present4',
      '/scenes/penguindash/img/element-present4.png');
  this.load.image('element-present5',
      '/scenes/penguindash/img/element-present5.png');
  this.load.image('element-present6',
      '/scenes/penguindash/img/element-present6.png');
  this.load.image('element-presentStacked',
      '/scenes/penguindash/img/element-presentStacked.png');

  this.load.image('element-coal1',
      '/scenes/penguindash/img/element-coal1.png');
  this.load.image('element-coal2',
      '/scenes/penguindash/img/element-coal2.png');
  this.load.image('element-coal3',
      '/scenes/penguindash/img/element-coal3.png');
  this.load.image('element-tree1',
      '/scenes/penguindash/img/element-tree1.png');
  this.load.image('element-tree2',
      '/scenes/penguindash/img/element-tree2.png');

  this.load.spritesheet('sprite-duck',
      '/scenes/penguindash/img/sprite-duck.png', 169, 202, 22);
  this.load.spritesheet('sprite-green_elf',
      '/scenes/penguindash/img/sprite-green_elf.png', 169, 202, 17);
  this.load.spritesheet('sprite-orange_elf',
      '/scenes/penguindash/img/sprite-orange_elf.png', 169, 202, 16);
  this.load.spritesheet('sprite-walrus',
      '/scenes/penguindash/img/sprite-walrus.png', 169, 202, 17);
  this.load.spritesheet('sprite-angels',
      '/scenes/penguindash/img/sprite-angels.png', 900, 750, 1);
  this.load.spritesheet('sprite-sm_iceberg',
      '/scenes/penguindash/img/sprite-sm_iceberg.png', 720, 480, 1);
  this.load.spritesheet('sprite-iceberg',
      '/scenes/penguindash/img/sprite-iceberg.png', 1200, 900, 1);
  this.load.spritesheet('sprite-snowman',
      '/scenes/penguindash/img/sprite-snowman.png', 736, 616, 1);

  // still image fallback for mobile
  this.load.spritesheet('element-duck',
      '/scenes/penguindash/img/element-duck.png');
  this.load.spritesheet('element-green_elf',
      '/scenes/penguindash/img/element-green_elf.png');
  this.load.spritesheet('element-orange_elf',
      '/scenes/penguindash/img/element-orange_elf.png');
  this.load.spritesheet('element-walrus',
      '/scenes/penguindash/img/element-walrus.png');
  this.load.spritesheet('element-angels',
      '/scenes/penguindash/img/element-angels.png');
  this.load.spritesheet('element-sm_iceberg',
      '/scenes/penguindash/img/element-sm_iceberg.png');
  this.load.spritesheet('element-iceberg',
      '/scenes/penguindash/img/element-iceberg.png');
  this.load.spritesheet('element-snowman',
      '/scenes/penguindash/img/element-snowman.png');

  this.load.image('element-snow1',
      '/scenes/penguindash/img/element-snow1.png');
  this.load.image('element-snow1-shadow',
      '/scenes/penguindash/img/element-snow1-shadow.png');
  this.load.image('element-snow2',
      '/scenes/penguindash/img/element-snow2.png');
  this.load.image('element-snow2-shadow',
      '/scenes/penguindash/img/element-snow2-shadow.png');
  this.load.image('element-snow3',
      '/scenes/penguindash/img/element-snow3.png');
  this.load.image('element-snow3-shadow',
      '/scenes/penguindash/img/element-snow3-shadow.png');
  this.load.image('element-snow4',
      '/scenes/penguindash/img/element-snow4.png');
  this.load.image('element-snow4-shadow',
      '/scenes/penguindash/img/element-snow4-shadow.png');
  this.load.image('element-snow5',
      '/scenes/penguindash/img/element-snow5.png');
  this.load.image('element-snow5-shadow',
      '/scenes/penguindash/img/element-snow5-shadow.png');
  this.load.image('element-ice1',
      '/scenes/penguindash/img/element-ice1.png');
  this.load.image('element-ice1-shadow',
      '/scenes/penguindash/img/element-ice1-shadow.png');
  this.load.image('element-ice2',
      '/scenes/penguindash/img/element-ice2.png');
  this.load.image('element-ice2-shadow',
      '/scenes/penguindash/img/element-ice2-shadow.png');
  this.load.image('element-ice3',
      '/scenes/penguindash/img/element-ice3.png');
  this.load.image('element-ice3-shadow',
      '/scenes/penguindash/img/element-ice3-shadow.png');
  this.load.image('element-ice4',
      '/scenes/penguindash/img/element-ice4.png');
  this.load.image('element-ice4-shadow',
      '/scenes/penguindash/img/element-ice4-shadow.png');
  this.load.image('element-ice5',
      '/scenes/penguindash/img/element-ice5.png');
  this.load.image('element-ice5-shadow',
      '/scenes/penguindash/img/element-ice5-shadow.png');
  this.load.image('element-finish',
      '/scenes/penguindash/img/element-finish.png');

  this.load.image('element-start',
      '/scenes/penguindash/img/element-start.png');
  this.load.image('element-finish',
      '/scenes/penguindash/img/element-finish.png');
  this.load.image('element-celebrate',
      '/scenes/penguindash/img/element-celebrate.png');
  this.load.image('element-pole',
      '/scenes/penguindash/img/element-pole.png');

  this.load.spritesheet('sprite-wave1',
      '/scenes/penguindash/img/sprite-wave1.png', 250, 100, 41);
  this.load.spritesheet('sprite-wave2',
      '/scenes/penguindash/img/sprite-wave2.png', 250, 100, 55);
};


app.Preloader.prototype.create = function() {
  this.game.state.start('Game');
};