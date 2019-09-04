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
<main @animationend=${this._animationEnd}>
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
    `;
  }
}

customElements.define('santa-countdown', SantaCountdownElement);
