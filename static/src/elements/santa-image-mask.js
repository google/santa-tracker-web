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

import {html, LitElement} from 'lit-element';
import {directive} from 'lit-html';
import * as prefix from '../lib/prefix.js';
import styles from './santa-image-mask.css';


const clips = [
  {
    width: 436.6,
    height: 398,
    src: `M0,199.1c14,2.8,22.9,23,23.1,42.8l0,91.9c0,22.6,18.3,40.8,40.9,40.8c43.3-0.1,105.9,0.2,111.5,0.4 c19.8,0.3,40,9.1,42.8,23.1h0c2.8-14.1,23-22.9,42.8-23.1c5.5-0.2,68.2-0.5,111.5-0.4c22.6,0,40.9-18.2,40.9-40.8v-91.9 c0.3-19.8,9.1-40,23.1-42.8v-0.1c-14-2.8-22.9-23-23.1-42.8V64.4c0-22.6-18.3-40.8-40.9-40.8c-43.3,0.1-105.9-0.2-111.5-0.4 c-19.8-0.3-40-9.1-42.8-23.1l0,0c-2.8,14.1-23,22.9-42.8,23.1c-5.5,0.2-68.2,0.5-111.5,0.4c-22.6,0-40.9,18.2-40.9,40.8l0,91.9 C22.9,176,14,196.2,0,199.1L0,199.1z`,
  },
  {
    width: 397.36,
    height: 377,
    src: `M16.8,188.4c0,18.7-12,85.1-13.6,93.8c-17,89.8,38.6,98.8,77.2,90.1c9.8-2.2,104.3-21,118.2,4.6h0.2 c13.9-25.5,108.4-6.8,118.2-4.6c38.5,8.7,94.1-0.2,77.2-90.1c-1.6-8.7-13.6-75.1-13.6-93.8s12-85.1,13.6-93.8 c17-89.8-38.6-98.8-77.2-90.1c-9.8,2.2-104.3,21-118.2-4.6l-0.2,0C184.6,25.5,90.1,6.8,80.3,4.6C41.8-4.2-13.8,4.8,3.1,94.6 C4.8,103.3,16.8,169.7,16.8,188.4z`,
  },
  {
    width: 526.75,
    height: 292.9,
    src: `M526.7,265.3c0.6,9.5-2.3,18.4-10,22.7c-6.4,3.6-14.4,4.9-21.4,4.9c-0.1,0-231.9,0-231.9,0s-231.8,0-231.9,0 c-7,0-15-1.3-21.4-4.9c-7.7-4.4-10.6-13.3-10-22.7c0.8-12,5.3-24.1,8.4-35.6c2.5-9.1,5-18.3,7.4-27.4c2.6-9.6,6.8-20.6,4.6-30.8 c-2.2-10-9.1-17.9-15.3-25c6.2-7.1,13.1-15,15.3-25c2.2-10.2-2-21.2-4.6-30.8c-2.5-9.1-5-18.3-7.4-27.4C5.4,51.8,0.9,39.6,0.1,27.6 c-0.6-9.5,2.3-18.4,10-22.7C16.5,1.3,24.4,0,31.5,0c0.1,0,231.9,0,231.9,0s231.8,0,231.9,0c7,0,15,1.3,21.4,4.9 c7.7,4.4,10.6,13.3,10,22.7c-0.8,12-5.3,24.1-8.4,35.6c-2.5,9.1-5,18.3-7.4,27.4c-2.6,9.6-6.8,20.6-4.6,30.8 c2.2,10,9.1,17.9,15.3,25c-6.2,7.1-13.1,15-15.3,25c-2.2,10.2,2,21.2,4.6,30.8c2.5,9.1,5,18.3,7.4,27.4 C521.4,241.1,525.9,253.3,526.7,265.3z`,
  },
  {
    width: 542.44,
    height: 297.8,
    src: `M536.1,21.7L536.1,21.7l-23.6-3.9L491.2,0h-220h-220L29.8,17.7L6.2,21.6v0c-8.3,1.6-8.3,252.9,0,254.6v0  l23.6,3.9l21.4,17.7h220h220l21.4-17.7l23.6-3.9v0C544.5,274.6,544.5,23.3,536.1,21.7z`,
  },
];


function even(value) {
  value = Math.ceil(value);
  if (value % 2) {
    ++value;
  }
  return value;
}


class SantaImageMaskElement extends LitElement {
  static get properties() {
    return {
      size: {type: Number},
      src: {type: String},
      card: {type: Number},
      _idPrefix: {type: String},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();
    this.card = ~~(Math.random() * clips.length);
  }

  render() {
    const size = this.size || 0;
    const card = clips[(this.card || 0) % clips.length];

    const scaleX = (this.size || 0) / card.width;
    const scaleY = (this.size || 0) / card.height;
    const scale = Math.min(scaleX, scaleY);

    const height = even(scale * card.height);  // so that transformY(-50%) doesn't odd-pixel us
    const squarePath = `M0 0 L${size} 0 L${size} ${height} L0 ${height} Z`;

    // https://github.com/Polymer/lit-html/issues/423
    const namespaced = directive((value) => (part) => {
      part.committer.element.setAttributeNS('http://www.w3.org/1999/xlink', part.committer.name, value);
    });
    return html`
<svg width="${size}" height="${height}">
<linearGradient id="${this._idPrefix}fade" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="black" stop-opacity="0.2"/>
<stop offset="100%" stop-color="black"/>
</linearGradient>
<clipPath id="${this._idPrefix}path" transform="scale(${scale} ${scale})">
<path d="${card.src}" />
</clipPath>
<rect class="target" width="${size}" height="${height}"></rect>
<path class="shadow" d="${squarePath}" clip-path="url(#${this._idPrefix}path)" fill="url(#${this._idPrefix}fade)"></path>
<g class="focus">
  <image xlink:href="${namespaced(this.src)}" clip-path="url(#${this._idPrefix}path)" preserveAspectRatio="xMaxYMax slice" width="${size}" height="${height}" />
  <g clip-path="url(#${this._idPrefix}path)">
    <path transform="scale(${scale} ${scale})" d="${card.src}" style="stroke: var(--stroke-color, transparent); stroke-width: calc(var(--stroke-width, 2) / ${scale/2}); fill: none" width="${size}" height="${height}" />
  </g>
</g>
</svg>
    `;
  }
}

customElements.define('santa-image-mask', SantaImageMaskElement);
