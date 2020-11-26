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
import {countdownSplit} from '../lib/time.js';
import styles from './santa-countdown.css';
import {_msg} from '../magic.js';
import {ifDefined} from 'lit-html/directives/if-defined';


function pad(x) {
  if (x == null) {
    return '';
  }
  x = ~~x || 0;
  return x < 10 ? `0${x}` : x;
}


export class SantaCountdownElement extends LitElement {
  static get properties() {
    return {
      until: {type: Number},  // The specific Date to count to.

      _currentSplit: {type: Object},
      _previousSplit: {type: Object},
      _hideOffset: {type: Number},
    };
  }

  constructor() {
    super();

    this._currentSplit = {count: 0};
    this._previousSplit = {count: 0};

    this.until = 0;
    this._interval = 0;
    this._hideOffset = 0;
  }

  static get styles() {
    return [styles];
  }

  _tick() {
    this._previousSplit = this._currentSplit;

    const now = +new Date;
    const s = countdownSplit(this.until - now);
    this._currentSplit = s;

    if (!window.Intl || !window.Intl.RelativeTimeFormat) {
      return;
    }

    const key = ['', 'seconds', 'minutes', 'hours', 'days'][s.count] || '';
    if (!key) {
      this.removeAttribute('aria-label');
    } else {
      const formatter = new Intl.RelativeTimeFormat();
      const label = formatter.format(s[key], key);
      this.setAttribute('aria-label', label + '\n' + _msg`countdownlabel`);
    }
  }

  update(changedProperties) {
    if (changedProperties.has('until')) {
      const now = +new Date;

      if (this.until < now) {
        window.clearInterval(this._interval);
        this._interval = 0;
        this._currentSplit = {count: 0};
      } else if (!this._interval) {
        this._tick();
        this._interval = window.setInterval(() => this._tick(), 1000);
      }
    }

    super.update(changedProperties);
  }

  _animationEnd(event) {
    const node = event.target.closest('.counter-box');

    this._previousSplit = {...this._previousSplit, [node.getAttribute('data-key')]: undefined};
  }

  render() {
    const prev = this._previousSplit;
    const split = this._currentSplit;
    const isHuge = (split.days >= 300);

    const classFor = (x) => {
      return (split[x] !== prev[x] && prev[x] !== undefined) ? 'anim' : '';
    };

    // Generates the order in which these elements should be hidden.
    const hide = (value) => {
      if (!(value < 4 && isHuge)) {
        const out = value - split.count + 4;
        if (out <= 4) {
          return out;
        }
      }
      return ifDefined(undefined);
    };

    return html`
<main @animationend=${this._animationEnd} class=${split.count ? '' : 'done'}>
  <svg viewBox="0 0 11 44" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid meet">
    <path d="M11,0 C9.18902037,0.133131303 7.51223617,0.599091955 6.23781871,1.99697318 C3.68903501,4.19364368 4.09147493,7.85478539 4.42683908,10.7836552 C4.56098328,12.2481264 4.6951348,13.779115 4.62805904,15.4432835 C4.56098328,19.3706399 2.81707942,21.5007204 0,22.033295 C2.81707942,22.565797 4.56098328,24.6958775 4.62805904,28.6233065 C4.6951348,30.2874024 4.56098328,31.8184636 4.42683908,33.2163448 C4.09147493,36.1452146 3.75610345,39.8063563 6.23781871,42.0030268 C7.51223617,43.400908 9.18902037,43.93341 11,44 L11,0 Z"/>
  </svg>

  <div class="inner">
    <div class="counter-box ${classFor('days')} ${split.days >= 100 ? 'large' : ''}" data-key="days" data-order=${hide(4)}>
      <div class="holder active">${pad(split.days)}</div>
      <div class="holder prev">${pad(prev.days)}</div>
      <h2>${_msg`countdown_days`}</h2>
    </div>
    <div class="counter-box ${classFor('hours')}" data-key="hours" data-order=${hide(3)}>
      <div class="holder active">${pad(split.hours)}</div>
      <div class="holder prev">${pad(prev.hours)}</div>
      <h2>${_msg`countdown_hours`}</h2>
    </div>
    <div class="counter-box ${classFor('minutes')}" data-key="minutes" data-order=${hide(2)}>
      <div class="holder active">${pad(split.minutes)}</div>
      <div class="holder prev">${pad(prev.minutes)}</div>
      <h2>${_msg`countdown_minutes`}</h2>
    </div>
    <div class="counter-box ${classFor('seconds')}" data-key="seconds" data-order=${hide(1)}>
      <div class="holder active">${pad(split.seconds)}</div>
      <div class="holder prev">${pad(prev.seconds)}</div>
      <h2>${_msg`countdown_seconds`}</h2>
    </div>
  </div>

  <svg viewBox="0 0 11 44" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet">
    <g transform="translate(5.5, 22) scale(-1, 1) translate(-5.5, -22)">
      <path d="M11,0 C9.18902037,0.133131303 7.51223617,0.599091955 6.23781871,1.99697318 C3.68903501,4.19364368 4.09147493,7.85478539 4.42683908,10.7836552 C4.56098328,12.2481264 4.6951348,13.779115 4.62805904,15.4432835 C4.56098328,19.3706399 2.81707942,21.5007204 0,22.033295 C2.81707942,22.565797 4.56098328,24.6958775 4.62805904,28.6233065 C4.6951348,30.2874024 4.56098328,31.8184636 4.42683908,33.2163448 C4.09147493,36.1452146 3.75610345,39.8063563 6.23781871,42.0030268 C7.51223617,43.400908 9.18902037,43.93341 11,44 L11,0 Z"/>
    </g>
  </svg>
</div>
    `;
  }
}

customElements.define('santa-countdown', SantaCountdownElement);
