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


import buildRand from './rand.js';

function disableImageSmoothing(context) {
  const prefixes = ['moz', 'o', 'webkit', 'ms'];
  context.imageSmoothingEnabled = false;
  prefixes.forEach((prefix) => context[`${prefix}ImageSmoothingEnabled`] = false);
}


export function scaleCopy(src, dst, scale) {
  if (!dst) {
    dst = document.createElement('canvas');
  }

  const w = src.width * scale;
  const h = src.height * scale;

  const round = (x) => {
    if (x % 2) {
      return x + 1;
    }
    return x;
  };

  // destination must be even
  dst.width = round(w);
  dst.height = round(h);

  const context = dst.getContext('2d');
  disableImageSmoothing(context);
  context.drawImage(src, 0, 0, w, h);

  return dst;
}


export function renderText(text, {width, color, font, lineHeight}) {
  const start = performance.now();
  const chars = text.split('');
  const holder = document.createElement('div');
  holder.style.font = font;
  holder.style.position = 'absolute';
  holder.style.top = 0;
  holder.style.width = `${width}px`;
  holder.style.opacity = 0.9;
  document.body.appendChild(holder);

  const nodes = chars.map((char) => {
    const c = document.createElement('span');
    c.textContent = char;
    holder.appendChild(c);
    return c;
  });
  nodes.push(document.createElement('div'));

  const lines = [];
  let previousTop = nodes[0].offsetTop;
  let consumed = 0;
  let x = 0;

  while (nodes.length > 1) {
    const checkNode = nodes[consumed + 1];
    const top = checkNode ? checkNode.offsetTop : -100;

    if (top !== previousTop) {
      const part = chars.splice(0, consumed + 1).join('').trim();
      part && lines.push(part);
      nodes.splice(0, consumed + 1);
      consumed = 0;
      previousTop = top;
    } else {
      ++consumed;
    }
  }
  holder.parentNode.removeChild(holder);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;

  canvas.width = width;
  canvas.height = ~~(lineHeight * (lines.length + 0.5));

  context.font = font;
  context.textAlign = 'center';
  context.fillStyle = color;
  lines.forEach((line, i) => {
    context.fillText(line, width / 2, (i+1) * lineHeight);
  });

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  const average = (i) => {
    const v = 
        (imageData.data[i-4] || 0) +
        (imageData.data[i+4+3] || 0);
    return ~~(v / 2);
  };

  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = imageData.data[i + 3];
    const a = average(i);
    let output;

    if (v < 80) {
      output = 0;
    } else if (a < 200) {
      output = 200;
    } else {
      output = 255;
    }
    imageData.data[i+3] = output;
  }

  const w = canvas.width * 4;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const up1 = imageData.data[i + 3 - 4 - w];
    const up2 = imageData.data[i + 3 - 4 - w*2];
    const v = imageData.data[i + 3];

    if ((up1 > 128 || up2 > 128) && !v) {
      imageData.data[i+0] = 0;
      imageData.data[i+1] = 0;
      imageData.data[i+2] = 0;
      imageData.data[i+3] = 32;
    }
  }

  context.putImageData(imageData, 0, 0);

  const duration = performance.now() - start;
  console.warn('text render took', duration.toFixed(2), 'for length', text.length);
  return canvas;
}


export class Render {
  constructor() {
    this._ready = [];
    this._assets = {};
    this._randSeed = ~~(Math.random() * 0xFFFFFFF);

    this._preload(`img/tiles.png`);
  }

  _preload(src) {
    const p = new Promise((r) => {
      const i = new Image();
      this._assets[src] = i;
      i.onload = i.onerror = () => r(i);
      i.src = src;
    });
    this._ready.push(p);
  }

  ready() {
    if (this._ready === null) {
      throw new Error('ready twice');
    }
    const out = Promise.all(this._ready);
    this._ready = null;
    out.then(() => this._afterReady());
    return out;
  }

  _afterReady() {
    // TODO: something
  }

  render(canvas, w, h) {
    canvas = canvas || document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    const now = performance.now();
    const sec = now / 1000;
    const rand = buildRand(this._randSeed);
    const tiles = this._assets['img/tiles.png'];

    const wt = Math.ceil(w / 32);
    const ht = Math.ceil(h / 32);

    const snowLine = Math.round(ht * 0.25);

    // Draw background sky.
    context.fillStyle = '#3399ff';
    context.fillRect(0, 0, 32 * wt, 32 * (snowLine + 2));

    // Draw individual tiles below snowLine.
    for (let x = 0; x < wt; ++x) {
      for (let y = snowLine + 1; y < ht; ++y) {
        context.drawImage(tiles, 0, 0, 32, 32, 32 * x, 32 * y, 32, 32);
      }
    }

    // Draw a number of clouds.
    const cloudCount = ~~Math.sqrt(wt * snowLine) * 1;
    for (let i = 0; i < cloudCount; ++i) {
      let x = ~~(rand() * wt * 32) - 16 + (sec * ((rand() * 12) - 6));  // drift consistently
      const y = (snowLine / cloudCount) * i * 32;                       // space clouds over y

      // wrap clouds
      if (x < -32) {
        x = (w + 32) + (x % (w + 32));
      } else if (x > w + 16) {
        x = (x % w) - 64;
      }

      context.drawImage(tiles, 32, 0, 32, 32, ~~x, ~~y, 32, 32);
    }

    // Draw repeated top.
    for (let x = ~~(rand() * -8); x < wt; x += 8) {
      context.drawImage(tiles, 0, 64, 256, 64, 32 * x, 32 * snowLine, 256, 64);
    }

    // Fill arc and remove.
    context.save();
    context.fillStyle = 'white';
    const draw = () => {
      const v = [14, 10, 8, 6, 5];
      v.forEach((size, off) => {
        context.rect(off, 0, 1, size);
        context.rect(0, off, size, 1);
      });
    };
    for (let i = 0; i < 4; ++i) {
      draw();
      context.translate(w, 0);
      context.rotate(Math.PI / 2);
    }
    context.globalCompositeOperation = 'destination-out';
    context.fill();
    context.restore();

    // Done!
    return {canvas};
  }
}

