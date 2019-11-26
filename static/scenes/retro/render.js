
import buildRand from './rand.js';

function disableImageSmoothing(context) {
  const prefixes = ['moz', 'o', 'webkit', 'ms'];
  context.imageSmoothingEnabled = false;
  prefixes.forEach((prefix) => context[`${prefix}ImageSmoothingEnabled`] = false);
}

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

export class Render {
  constructor(target) {
    this._target = target;
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

  render(width, height, extra) {
    const rawRatio = window.devicePixelRatio || 1;
    const ratio = Math.ceil(rawRatio);
    const extraRatio = ratio * extra;

    const t = this._target;
    t.width = width * extraRatio;
    t.height = height * extraRatio;
    t.style.width = `${width * extra}px`;  // dots size
    t.style.height = `${height * extra}px`;

    // Now, render the real image.
    this._internalRender(width, height);

    const tc = t.getContext('2d');
    disableImageSmoothing(tc);
    tc.drawImage(canvas, 0, 0, canvas.width * extraRatio, canvas.height * extraRatio);
  }

  _internalRender(w, h) {
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
      const x = ~~(rand() * wt * 32) - 16 + (sec * ((rand() * 8) - 4));  // drift consistently
      const y = (snowLine / cloudCount) * i * 32;                        // space clouds over y
      context.drawImage(tiles, 32, 0, 32, 32, ~~x, ~~y, 32, 32);
    }

    // Draw repeated top.
    for (let x = ~~(rand() * -8); x < wt; x += 8) {
      context.drawImage(tiles, 0, 64, 256, 64, 32 * x, 32 * snowLine, 256, 64);
    }
  }
}

