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

import * as common from '../core/common.js';
import {_static, _msg} from '../magic.js';
import styles from './santa-santa.css';
import {LitElement, html} from 'lit-element';

const santaDir = 'n ne e se s sw w nw'.split(' ');
const assetRoot = _static`img/sleigh`;


/**
 * @param {number} heading to find direction for
 * @return {string} direction to render
 */
function dirForHeading(heading) {
  if (isNaN(heading) || typeof heading !== 'number') {
    return 's';  // default to 's' as it looks sane
  }
  const offset = 360 / (santaDir.length * 2);                   // 27.5 deg
  const normalized = (((heading + offset) % 360) + 360) % 360;  // mod 360
  const index = Math.floor(normalized / 360 * santaDir.length);
  return santaDir[index];
}


const urls = [
  'chimney0.gif',
  'chimney1.gif',
  'effects.svg',
];
santaDir.forEach((dir) => {
  urls.push(`sleigh-${dir}-back.svg`);
  urls.push(`sleigh-${dir}-front.svg`);
  urls.push(`sleigh-${dir}-santa.svg`);
});
common.preload.assets(...urls.map((raw) => `${assetRoot}/${raw}`));


class SantaSantaElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      heading: {type: Number},
      stop: {type: Boolean},
    };
  }

  render() {
    const dir = dirForHeading(this.heading);
    const mode = Math.floor(Math.abs(this.heading) % 2);  // could be decimal
    return html`
<div id="outer">
  <button>${_msg`santasearch_character_santa`}</button>
  <div class="presents mode${mode}" ?hidden=${!this.stop}></div>
  <div class="sleigh" data-dir=${dir} ?hidden=${this.stop}>
    <div class="back"></div>
    <div class="santa"></div>
    <div class="front"></div>
  </div>
</div>
    `;
  }
}

customElements.define('santa-santa', SantaSantaElement);
