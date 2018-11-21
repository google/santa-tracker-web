import {LitElement, html} from '@polymer/lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';


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
<style>${_style`santa-badge`}</style>

<div class="items ${this.level && (this._levelActive || !displayScore) ? 'level-active' : ''}">
  <div class="part-score">
    <div class="cell" .hidden=${!displayScore}>
      <div class="value">${score}<small>${unit}</small></div>
      <div class="label">${_msg`score`}</div>
    </div>
  </div>
  <div class="feature ${this.time ? '' : 'icon'}">
    <svg viewBox="0 0 117.44 80">
      <path class="shadow" d="M115.49,33.33C112.31,32,114,21,113.77,23.49c.5-4.53,3.32-17.34,3.64-23.49H6.78c-1,6.15-1,19-1.48,23.49C5.58,21,4.9,32,1.44,33.33c3.46,1.3,4.14,12.36,3.86,9.84.54,5,.44,20.28,1.85,25.27A14.54,14.54,0,0,0,14.43,77c3.44,1.81,13.34.69,16.7.27,2.78-.36,14.67-.62,17.9-.62-1.88,0,13.07-.74,14.51,3.38.55-4.12,14.76-3.36,12.87-3.38,3.23,0,14.27.26,17.12.62C97,77.66,109,78.78,112,77a10.86,10.86,0,0,0,5.42-8.53c.32-5-3.1-20.23-3.65-25.27C114,45.69,112.31,34.63,115.49,33.33Z" />
      <path class="fill" d="M111.21,16.14c0-3.12.63-10,1-16.14H1.84c.32,6.15.94,13,1,16.14,0-2.62.53,8.9-2.79,10.25,3.32,1.34,2.79,12.87,2.79,10.25C2.78,41.89,1,57.76,1.89,63a13,13,0,0,0,6.34,8.89c3.25,1.87,13.26.71,16.67.28,2.81-.38,14.73-.65,18-.65C41,71.5,56,70.7,57,75c1-4.3,15.11-3.5,13.23-3.52,3.23,0,14.23.27,17,.65,3.4.43,15.24,1.59,18.49-.28A13,13,0,0,0,112.11,63c.87-5.2-.89-21.07-.9-26.32,0,2.62-.53-8.91,2.79-10.25C110.68,25,111.21,13.52,111.21,16.14Z" />
    </svg>
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
