import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './santa-badge.css';
import {_msg} from '../magic.js';


const MAX_TIME = (10 * 60) - 1;  // max is 9:59
const LEVEL_ACTIVE_TIME = 1500;  // show score on small screens for this long
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

    // TODO(samthor): Shown for a demo.
    this.level = 1;
    this.maxLevel = 3;
    this.score = 10e3;
    this.time = 20;

    this._levelActiveTimeout = 0;
  }

  shouldUpdate(changedProperties) {
    const out = super.shouldUpdate(changedProperties);

    if (changedProperties.has('level')) {
      this._levelActive = true;

      window.clearTimeout(this._levelActiveTimeout);
      this._levelActiveTimeout = window.setTimeout(() => {
        this._levelActive = false;
      }, LEVEL_ACTIVE_TIME);
    }

    return out;
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
    return html`
<div class="items ${this.level && (this._levelActive || !displayScore) ? 'level-active' : ''}">
  <div class="part-score">
    <div class="cell" .hidden=${!displayScore}>
      <div class="value">${score}<small>${unit}</small></div>
      <div class="label">${_msg`score`}</div>
    </div>
  </div>
  <div class="feature ${this.time ? '' : 'show-icon'}">
    <div class="icon" style=${ifDefined(this.logo ? `background-image: url(${this.logo})` : undefined)}></div>
    <div class="cell">
      <div class="value">
<span class=${ifDefined(minutes ? undefined : 'dim')}>${minutes}<small>:</small></span>${pad(seconds)}
      </div>
      <div class="label">${_msg`time`}</div>
    </div>
  </div>
  <div class="part-level">
    <div class="cell" .hidden=${!this.level}>
      <div class="value">
${this.level}<span class="dim" .hidden=${!this.maxLevel}><small>&middot;</small>${this.maxLevel}</span>
      </div>
      <div class="label">${_msg`level`}</div>
    </div>
  </div>
</div>
    `;
  }
}


customElements.define('santa-badge', SantaBadgeElement);
