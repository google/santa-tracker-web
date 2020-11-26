/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('app.TileManager');

goog.require('Utils');

// singleton to render tiled entities (walls, pits, and platforms)
class TileManager {
  init(context) {
    this.tileImages = context.querySelector('[data-tile-slices]');
    this.canvas = context.querySelector('[data-tile-canvas]');
    this.ctx = this.canvas.getContext('2d');
  }

  renderEntity(type, width, height, elem) {
    const config = TileManager.ASSETS[type];
    if (!config) {
      return;
    }

    const scaleFactor = 2;
    this.canvas.width = Utils.gridToPixelValue(width) * scaleFactor;
    this.canvas.height = Utils.gridToPixelValue(height) * scaleFactor;

    const {tileSize} = config;
    let j = 0;
    while(j < height) {
      let rowConfig;
      if (j == 0) {
        rowConfig = config.top;
      } else if (j == height - (config.bottom.height || tileSize)) {
        rowConfig = config.bottom;
      } else if (j == (config.top.height || 1) && config.middle1) {
        rowConfig = config.middle1;
      } else {
        rowConfig = config.middle;
      }

      let i = 0;
      while(i < width) {
        let tileConfig;
        if (i == 0) {
          tileConfig = rowConfig.left;
        } else if (i == width - tileSize) {
          tileConfig = rowConfig.right;
        } else {
          tileConfig = rowConfig.middle;
        }

        let imgSrc = tileConfig.path;
        if (tileConfig.path_alt && i % 2) {
          imgSrc = tileConfig.path_alt;
        }

        const imgElem = this.tileImages.querySelector(`[src="${tileConfig.path}"]`);
        const x = Utils.gridToPixelValue(i) * scaleFactor;
        const y = Utils.gridToPixelValue(j) * scaleFactor;
        const tileHeight = Utils.gridToPixelValue(rowConfig.height || tileSize) * scaleFactor;
        const tileWidth = Utils.gridToPixelValue(tileSize) * scaleFactor;
        this.ctx.save();
        this.ctx.translate(x, y);
        if (tileConfig.flipped) {
          this.ctx.scale(-1, 1);
          this.ctx.drawImage(imgElem, -tileWidth, 0, tileWidth, tileHeight);
        } else {
          this.ctx.drawImage(imgElem, 0, 0, tileWidth, tileHeight);
        }
        this.ctx.restore();

        i += tileSize;
      }

      j += rowConfig.height || tileSize;
    }

    const img = new Image(Utils.gridToPixelValue(width), Utils.gridToPixelValue(height));
    img.src = this.canvas.toDataURL("image/png");
    elem.appendChild(img);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

TileManager.ASSETS = {
  pit: {
    tileSize: 1,
    top: {
      height: 2,
      left: {
        path: 'img/pit/pit_top_left.svg'
      },
      middle: {
        path: 'img/pit/pit_top_middle.svg'
      },
      right: {
        path: 'img/pit/pit_top_right.svg'
      },
    },
    middle1: {
      left: {
        path: 'img/pit/pit_middle1_left.svg'
      },
      middle: {
        path: 'img/pit/pit_middle_middle.svg'
      },
      right: {
        path: 'img/pit/pit_middle1_right.svg'
      },
    },
    middle: {
      left: {
        path: 'img/pit/pit_middle_left.svg'
      },
      middle: {
        path: 'img/pit/pit_middle_middle.svg'
      },
      right: {
        path: 'img/pit/pit_middle_right.svg'
      },
    },
    bottom: {
      left: {
        path: 'img/pit/pit_bottom_left.svg'
      },
      middle: {
        path: 'img/pit/pit_bottom_middle.svg'
      },
      right: {
        path: 'img/pit/pit_bottom_right.svg'
      },
    },
  },
  wall: {
    tileSize: 1,
    top: {
      left: {
        path: 'img/wall/wall_top_side.svg'
      },
      middle: {
        path: 'img/wall/wall_top_middle.svg'
      },
      right: {
        path: 'img/wall/wall_top_side.svg',
        flipped: true
      },
    },
    middle: {
      left: {
        path: 'img/wall/wall_middle_side.svg'
      },
      middle: {
        path: 'img/wall/wall_middle.svg'
      },
      right: {
        path: 'img/wall/wall_middle_side.svg',
        flipped: true
      },
    },
    bottom: {
      height: 3,
      left: {
        path: 'img/wall/wall_bottom_side.svg'
      },
      middle: {
        path: 'img/wall/wall_bottom_middle_1.svg',
        path_alt: 'img/wall/wall_bottom_middle_2.svg',
      },
      right: {
        path: 'img/wall/wall_bottom_side.svg',
        flipped: true
      },
    },
  },
  platform: {
    tileSize: .5,
    top: {
      left: {
        path: 'img/platform/platform_top_side.png'
      },
      middle: {
        path: 'img/platform/platform_middle.png'
      },
      right: {
        path: 'img/platform/platform_top_side.png',
        flipped: true
      },
    },
    middle: {
      left: {
        path: 'img/platform/platform_middle_side.png'
      },
      middle: {
        path: 'img/platform/platform_middle.png'
      },
      right: {
        path: 'img/platform/platform_middle_side.png',
        flipped: true
      },
    },
    bottom: {
      left: {
        path: 'img/platform/platform_bottom_side.png'
      },
      middle: {
        path: 'img/platform/platform_bottom_middle.png',
      },
      right: {
        path: 'img/platform/platform_bottom_side.png',
        flipped: true
      },
    },
  },
};



app.TileManager = new TileManager();
