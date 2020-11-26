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

import '../polyfill/attribute.js';

const DIRECTIONAL_STRENGTH = 0;
const SNOWFLAKE_COUNT = 40;
const CLOUD_COUNT = 6;
const CLOUD_PART = 0.4;

const b64clouds = [
  'PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDIzMC4zIDEzOC41Ij48c3R5bGU+LnN0MHtmaWxsOiNmZmZ9PC9zdHlsZT48c3ltYm9sIGlkPSJOZXdfU3ltYm9sXzE0IiB2aWV3Qm94PSItNjcuNCAtMjQuMiAxMzQuOCA0OC41Ij48cGF0aCBjbGFzcz0ic3QwIiBkPSJNNjcuNC0xOGMwLTEuOC0uNS00LjgtMS4zLTYuM0gtNjYuMWMtLjggMS40LTEuMyA0LjUtMS4zIDYuMyAwIDUuMyA0LjMgOC41IDkuNyA4LjVoMjYuNHYuNWMwIDcgNS43IDEyLjYgMTIuNiAxMi42IDEuNiAwIDMuMS0uMyA0LjUtLjggMi4zIDEyLjIgMTMgMjEuNCAyNS45IDIxLjQgMTIuNiAwIDIzLjEtOC44IDI1LjctMjAuNkM0My45IDMuMiA0OS0yLjMgNDktOXYtLjVoOC43YzUuNCAwIDkuNy0zLjEgOS43LTguNXoiLz48L3N5bWJvbD48dXNlIHhsaW5rOmhyZWY9IiNOZXdfU3ltYm9sXzE0IiB3aWR0aD0iMTM0LjgiIGhlaWdodD0iNDguNSIgeD0iLTY3LjQiIHk9Ii0yNC4yIiB0cmFuc2Zvcm09Im1hdHJpeCgxLjcwODcgMCAwIC0xLjcwODcgMTE1LjE3MyA0MS40MDYpIiBvdmVyZmxvdz0idmlzaWJsZSIvPjwvc3ZnPg==',
  'PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDE5Ny4zIDExNy42Ij48c3R5bGU+LnN0MHtmaWxsOiNmZmZ9PC9zdHlsZT48c3ltYm9sIGlkPSJOZXdfU3ltYm9sXzE1IiB2aWV3Qm94PSItNTcuNyAtMzQuNCAxMTUuNSA2OC44Ij48cGF0aCBjbGFzcz0ic3QwIiBkPSJNNTcuNy0xOS40YzAtNS4zLTEuNy0xMS00LjYtMTVILTU2LjRjLS44IDEuNC0xLjMgMy4xLTEuMyA0LjggMCA1LjMgNC4zIDkuNyA5LjcgOS43aDExLjljLTEuNCAzLjUtMi4yIDcuMi0yLjIgMTEuMiAwIDE2LjYgMTMuNSAzMCAzMCAzMCAxLjMgMCAyLjUtLjEgMy44LS4yIDAgLjEtLjEuMS0uMS4yLjItLjEuNC0uMi41LS4zLjUgMCAxLS4xIDEuNC0uMiAzLjUgOCAxMS41IDEzLjYgMjAuOCAxMy42IDEyLjUgMCAyMi43LTEwLjEgMjIuNy0yMi43VjMuNmM5LjctMy4xIDE2LjktMTIuMiAxNi45LTIzeiIvPjwvc3ltYm9sPjx1c2UgeGxpbms6aHJlZj0iI05ld19TeW1ib2xfMTUiIHdpZHRoPSIxMTUuNSIgaGVpZ2h0PSI2OC44IiB4PSItNTcuNyIgeT0iLTM0LjQiIHRyYW5zZm9ybT0ibWF0cml4KDEuNzA4NyAwIDAgLTEuNzA4NyA5OC42NTIgNTguNzkyKSIgb3ZlcmZsb3c9InZpc2libGUiLz48L3N2Zz4=',
  'PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDExNy44IDcwLjciPjxzdHlsZT4uc3Qwe2ZpbGw6I2ZmZn08L3N0eWxlPjxzeW1ib2wgaWQ9Ik5ld19TeW1ib2xfMTYiIHZpZXdCb3g9Ii0yNiAtMTUuNiA1Mi4xIDMxLjMiPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0tMTguMi0zLjloMS4zVjBjMCA1LjggNC43IDEwLjQgMTAuNCAxMC40IDEuOCAwIDMuNC0uNSA0LjctMS4zIDEuNiAzLjggNS4zIDYuNSA5LjYgNi41IDUuOCAwIDEwLjQtNC43IDEwLjQtMTAuNFYxLjVDMjIuNyAwIDI2LTQuMiAyNi05LjFjMC0yLjQtLjgtNC43LTIuMS02LjVILTI1Yy0uNyAxLjEtMSAyLjUtMSAzLjkgMCA0LjMgMy40IDcuOCA3LjggNy44eiIvPjwvc3ltYm9sPjx1c2UgeGxpbms6aHJlZj0iI05ld19TeW1ib2xfMTYiIHdpZHRoPSI1Mi4xIiBoZWlnaHQ9IjMxLjMiIHg9Ii0yNiIgeT0iLTE1LjYiIHRyYW5zZm9ybT0ibWF0cml4KDIuMjYwNSAwIDAgLTIuMjYwNSA1OC44ODQgMzUuMzMpIiBvdmVyZmxvdz0idmlzaWJsZSIvPjwvc3ZnPg==',
];

// TODO(samthor): only create on first use
const cloudImages = b64clouds.map((src) => {
  const i = new Image();
  i.src = `data:image/svg+xml;base64,${src}`;
  return i;
});

/**
 * Displays snow and clouds. Creates an internal `canvas` element that is updated to match the
 * width and height of this element every rAF.
 */
export class SantaWeatherElement extends HTMLElement {
  static get observedAttributes() { return ['active']; }

  constructor() {
    super();

    this._draw = this._draw.bind(this);
    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d');
    this._rAF = 0;

    // TODO(samthor): better styles for non-lit elements?
    this.style.display = 'block';
    this.style.pointerEvents = 'none';
    this._canvas.style.display = 'block';

    this.wind = 0;
    this._currentWind = 0;
    this._windTimeout = 0;

    this._snowflakes = [];
    this._clouds = [];

    for (let i = 0; i < SNOWFLAKE_COUNT; ++i) {
      this._snowflakes.push(null);
    }
    for (let i = 0; i < CLOUD_COUNT; ++i) {
      this._clouds.push(null);
    }
  }

  get active() {
    return this.hasAttribute('active');
  }

  set active(active) {
    this.toggleAttribute('active', active);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    this._maybeQueueDraw();
  }

  _maybeQueueDraw() {
    if (this._rAF || !this.active || !this.isConnected) {
      return false;
    }
    this._rAF = window.requestAnimationFrame(this._draw);
    return true;
  }

  connectedCallback() {
    this._maybeQueueDraw();
    this._chooseRandomWind();

    // nb. we CANNOT do this inside `constructor`, it interacts oddly with page events
    this.appendChild(this._canvas);
  }

  _chooseRandomWind() {
    if (!this.isConnected) {
      return false;
    }
    this.wind = 0.25 - Math.random() * 0.5 + DIRECTIONAL_STRENGTH;

    // Wait a random amount of time (up to 15 seconds) before changing the wind direction for the
    // snow.
    const wait = Math.random() * 15000;
    this._windTimeout = window.setTimeout(this._chooseRandomWind.bind(this), wait);
  }

  _makeSnowflakePosition(initial) {
    if (initial) {
      return {
        x: Math.random(),
        y: Math.random(),
      };
    }

    // Snowflakes have a 2/3 chance to spawn on the side of the screen. The chance for each side
    // is then scaled depending on the directional strength of the wind.
    const diversityChance = 2 / 3;
    const sideChance = diversityChance / 2.0;
    const leftChance = sideChance + DIRECTIONAL_STRENGTH * sideChance;
    const rightChance = 1.0 - (sideChance - DIRECTIONAL_STRENGTH * sideChance);
    const pos = Math.random();

    const x = pos < leftChance
        ? -0.1
        : pos > rightChance
          ? 1.1
          : Math.random();
    const y = (pos < leftChance || pos > rightChance)
        ? Math.random()
        : 0;

    return {x, y};
  }

  _draw() {
    const {offsetWidth: width, offsetHeight: height} = this;
    const ratio = window.devicePixelRatio || 1;

    if (this._canvas.width !== width * ratio || this._canvas.height !== height * ratio) {
      this._canvas.width = width * ratio;
      this._canvas.height = height * ratio;
      this._canvas.style.width = `${width}px`;
      this._canvas.style.height = `${height}px`;
    }

    this._rAF = 0;
    if (!this._maybeQueueDraw() || width === 0 || height === 0) {
      return false;
    }

    // update or create snowflakes
    this._snowflakes = this._snowflakes.map((snowflake) => {
      if (snowflake !== null) {
        // modify existing snowflake
        snowflake.x += 0.01 * this._currentWind * (1 / snowflake.d);
        snowflake.y += 0.0002 * snowflake.d * snowflake.ry;

        if (snowflake.y * height > height || snowflake.x < -0.1 || snowflake.x > 1.1) {
          // bad, continue below
        } else {
          return snowflake;
        }
      }

      const {x, y} = this._makeSnowflakePosition(snowflake === null);
      return {
        x,
        y,
        ry: 0.5 + Math.random(),
        d: 2 + Math.random() * 2,
        o: 0.6 + Math.random() * 0.4,
      };
    });

    // update or create clouds
    this._clouds = this._clouds.map((cloud) => {
      if (cloud !== null) {
        cloud.x += 0.001 * this._currentWind * cloud.m;

        if (this.wind > 0 && cloud.x * width > width + cloud.w ||
            this.wind < 0 && cloud.x * width < -cloud.w) {
          // bad, recreate below
        } else {
          return cloud;
        }
      }

      // Create a new cloud on either side of the screen.
      const cloudWidth = 50 + Math.random() * 100;
      const cloudHeight = cloudWidth * 0.6;
      const offscreenOffset = (cloudWidth / width) / 2;

      // Adjust the start position based on the wind value. Positive wind dir should imply that the
      // cloud starts screen left, and vice-versa.
      const x = cloud === null
          ? Math.random()
          : this.wind > 0 ? -offscreenOffset : 1 + offscreenOffset;

      return {
        img: Math.floor(Math.random() * cloudImages.length),
        w: cloudWidth,
        h: cloudHeight,
        m: 4 - (cloudWidth / 50),  // weight of cloud
        x,
        y: Math.random() * CLOUD_PART,
        o: 0.2 + Math.random() * 0.7,  // opacity of cloud
      };
    });

    // Ease the actual wind value to the new wind value.
    this._currentWind += (this.wind - this._currentWind) / 200;

    // Draw!
    this._ctx.save();
    this._ctx.scale(ratio, ratio);
    this._ctx.fillStyle = '#fff';
    this._ctx.clearRect(0, 0, width, height);

    for (const snowflake of this._snowflakes) {
      let alpha = 1;

      if (snowflake.y > 0.9) {
        // Fade out the snowflake at the end.
        alpha = 1 - ((snowflake.y - 0.9) / 0.1);
      }

      this._ctx.globalAlpha = snowflake.o * alpha;
      this._ctx.beginPath();
      this._ctx.arc(
          snowflake.x * width,
          snowflake.y * height,
          snowflake.d,
          0,
          Math.PI * 2,
      );

      this._ctx.closePath();
      this._ctx.fill();
    }

    for (const cloud of this._clouds) {
      this._ctx.globalAlpha = cloud.o;
      this._ctx.drawImage(
          cloudImages[cloud.img],
          (width * cloud.x) - cloud.w / 2,
          (height * cloud.y) - cloud.h / 2,
          cloud.w,
          cloud.h,
      );
    }

    this._ctx.restore();
  }
}


customElements.define('santa-weather', SantaWeatherElement);
