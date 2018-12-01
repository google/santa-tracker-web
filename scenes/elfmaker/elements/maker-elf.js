import {html, LitElement} from '@polymer/lit-element';
import {render} from 'lit-html';

import * as prefix from '../../../src/lib/prefix.js';
import * as defs from '../defs.js';

import {defaultCategoryChoices} from './maker-control.js';


export class MakerElfElement extends LitElement {
  static get properties() {
    return {
      svgStyle: {type: String},
      categoryChoice: {type: Object},
      _offset: {type: Number},
      _idPrefix: {type: String},
      _danceStartTime: {type: Number}
    };
  }

  constructor() {
    super();

    // Edge fails to ever render if it has NaN/invalid data, so set all defaults here.
    this._offset = 0;
    this._idPrefix = prefix.id();
    this.svgStyle = '';
    this.categoryChoice = defaultCategoryChoices();
  }

  connectedCallback() {
    super.connectedCallback();
    const run = () => {
      if (!this.isConnected) {
        return;
      }
      window.requestAnimationFrame(run);
      this._offset = (performance.now() / 1000);
    };
    run();
  }

  /**
   * @return {!Promise<string>}
   */
  async draw() {
    const canvasWidth = defs.width * 2;
    const canvasHeight = defs.height * 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    const bg = new Image();
    bg.src = defs.categoryChoice(this.categoryChoice, 'backgrounds');
    await new Promise((resolve, reject) => {
      bg.onload = resolve;
      bg.onerror = reject;
    });

    // draw the center of the scaled background image
    const bgScale = 1.2;
    const sw = canvasWidth / bgScale;
    const sh = canvasHeight / bgScale;
    const sx = (bg.width - sw) / 2;
    const sy = (bg.height - sh) / 2;
    ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);

    // create div, find the svg
    const div = document.createElement('div');
    render(this.render(true), div);
    const svg = div.querySelector('svg');

    // set w/h explicitly, otherwise Chrome or other browsers assume 'natural' SVG size
    svg.setAttribute('width', canvasWidth);
    svg.setAttribute('height', canvasHeight);

    // load the elf image with the base64 version of the SVG
    const elf = new Image();
    elf.src = 'data:image/svg+xml;base64,' + window.btoa(svg.outerHTML);
    await new Promise((resolve, reject) => {
      elf.onload = resolve;
      elf.onerror = reject;
    });

    ctx.drawImage(elf, 0, 0);
    return canvas.toDataURL();
  }

  dance() {
    if (!this._isDancing) {
      this._danceStartTime = performance.now();
    }
  }

  get _isDancing() {
    return (performance.now() - this._danceStartTime) < defs.danceDuration;
  }

  render() {
    // only render real styles in Shadow DOM
    const svgStyle = (self.ShadyCSS ? '' : this.svgStyle);

    return html`
<style>
:host {
  height: 100%;
  display: inline-block;
}
.shadow {
  height: 100%;
  display: flex;
  justify-content: center;
  will-change: transform;  /* nb. gives about 3x speedup */
  filter: drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.125));
}
svg {
  width: 100%;
  height: 100%;
}
</style>

<div class="shadow" @click="${this.dance}">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-40 -100 400 560">
  <style>
${svgStyle}
.blink {
  animation: elves-blink 5.234s infinite alternate;
}

.dance {
  transform-origin: center 100%;
  animation: elves-dance 3s ease-in-out infinite alternate;
}

@keyframes elves-blink {
  0%   { transform: scaleY(1); }
  98%  { transform: scaleY(1); }
  100% { transform: scaleY(0); }
}

@keyframes elves-dance {
  0%     { transform: translate3d(0, 0, 0) rotateZ(0); }
  6.25%  { transform: translate3d(2.5%, -10%, 0) rotateZ(7.5deg); }
  12.5%  { transform: translate3d(0, 0, 0) rotateZ(7.5deg); }
  18.75% { transform: translate3d(-2.5%, -10%, 0) rotateZ(-7.5deg); }
  25%    { transform: translate3d(0, 0, 0) rotateZ(-7.5deg); }
  31.25% { transform: translate3d(0, -12.5%, 0) rotateZ(0); }
  37.5%  { transform: translate3d(0, -2.5%, 0) rotateZ(0); }
  43.75% { transform: translate3d(0, -12.5%, 0) rotateZ(0); }
  50.0%  { transform: translate3d(0, -2.5%, 0) rotateZ(0); }
  56.25% { transform: translate3d(0, 0%, 0) rotateZ(12.5deg); }
  62.5%  { transform: translate3d(0, 0%, 0) rotateZ(-2.5deg); }
  68.75% { transform: translate3d(0, 0%, 0) rotateZ(2.5deg); }
  75%    { transform: translate3d(0, 0%, 0) rotateZ(-12.5deg); }
  81.25% { transform: translate3d(2.5%, -10%, 0) rotateZ(7.5deg); }
  87.5%  { transform: translate3d(0, 0, 0) rotateZ(7.5deg); }
  93.75% { transform: translate3d(-2.5%, -10%, 0) rotateZ(-7.5deg); }
  100%   { transform: translate3d(0, 0, 0) rotateZ(0); }
}
  </style>
  ${defs.drawElf(this.categoryChoice, this._offset, this._isDancing, this._danceStartTime)}
</svg>
</div>
    `;
  }
}

customElements.define('maker-elf', MakerElfElement);
