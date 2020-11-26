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
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './santa-badge.css';
import {_msg} from '../magic.js';


const MAX_TIME = (10 * 60) - 1;  // max is 9:59
const LEVEL_ACTIVE_TIME = 2000;  // show level change for this long
const pad = (x) => x < 10 ? `0${x}` : x;


export class SantaBadgeElement extends LitElement {
  static get properties() {
    return {
      level: {type: Number},
      maxLevel: {type: Number},
      score: {type: Number},
      _levelActive: {type: Boolean},
      time: {type: Number},
      logo: {type: Boolean},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this.level = 0;
    this.maxLevel = 0;
    this.score = 0;
    this.time = 0;

    this._levelActiveTimeout = 0;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('level')) {
      window.clearTimeout(this._levelActiveTimeout);

      if (this.level) {
        this._levelActive = true;
        this._levelActiveTimeout = window.setTimeout(() => {
          this._levelActive = false;
        }, LEVEL_ACTIVE_TIME);
      }
    }
  }

  _splitScore() {
    let score = ~~this.score;

    if (score < 10000) {
      return {score, unit: ''};
    }

    score = ~~(score / 1000);
    if (score < 1000) {
      return {score, unit: 'k'};
    }

    score = ~~(score / 1000);
    if (score < 1000) {
      return {score, unit: 'm'};
    }

    return {score: '?', unit: ''};
  }

  render() {
    const time = Math.max(0, Math.min(this.time, MAX_TIME));
    const minutes = ~~(time / 60);
    const seconds = ~~(time % 60);
    const {score, unit} = this._splitScore();
    const displayScore = this.score > 0;

    let levelText = _msg`level`;
    let maxLevel = 0;
    if (this.maxLevel > 0) {
      maxLevel = this.maxLevel;
    } else if (this.maxLevel === 0) {
      levelText = _msg`snowball_iced`;
    }

    const displayRight = (this.level || this.score);

    return html`
<main>
  <div class="item ${displayRight ? 'hasAfter' : ''}" ?hidden=${!time}>
    <div class="data">
      <span>
        <span class=${ifDefined(minutes ? undefined : 'dim')}>${minutes}<small>:</small></span>${pad(seconds)}
      </span>
      <label>${_msg`time`}</label>
    </div>
  </div>
  <div class="item ${this.level && (this._levelActive || !displayScore) ? 'alt-active' : ''}" ?hidden=${!displayRight}>
    <div class="data">
      <span>${score}<small>${unit}</small></span>
      <label>${_msg`score`}</label>
    </div>
    <div class="data alt" ?hidden=${!this.level}>
      <span>${this.level}<span class="dim" ?hidden=${!maxLevel}><small>&middot;</small>${maxLevel}</span></span>
      <label>${levelText}</label>
    </div>
  </div>
</main>
    `;
  }
}


customElements.define('santa-badge', SantaBadgeElement);
