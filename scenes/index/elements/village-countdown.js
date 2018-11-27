import {html, LitElement} from '@polymer/lit-element';
import {countdownSplit} from '../../../src/lib/time.js';


function pad(x) {
  if (x == null) {
    return '';
  }
  if (x >= 100) {
    return '??';
  }
  return x < 10 ? `0${x}` : x;
}


export class VillageCountdownElement extends LitElement {
  static get properties() {
    return {
      time: {type: Number},
      _now: {type: Number},
      _time: {type: Object},
      _prev: {type: Object},
    };
  }

  _tick() {
    this._now = this.time + (this._timeSetAt - +new Date);
  }

  update(changedProperties) {
    if (changedProperties.has('time')) {
      if (this.time <= 0) {
        window.clearInterval(this._interval);
        this._interval = 0;
        this._now = 0;
      } else if (!this._interval) {
        this._now = this.time;
        this._interval = window.setInterval(() => this._tick(), 1000);
      }
      this._timeSetAt = +new Date;
    }

    if (changedProperties.has('_now')) {
      const timeSplit = countdownSplit(this._now);
      const prev = this._prev || {};
      const lastTime = this._time || {};
      for (const k in timeSplit) {
        if (lastTime[k] !== timeSplit[k]) {
          prev[k] = lastTime[k];
        }
      }
      this._time = timeSplit;
      this._prev = prev;  // possibly dangerous, same object ref
    }

    super.update(changedProperties);
  }

  _animationEnd(event) {
    const node = event.target.closest('.counter-box');
    this._prev = {...this._prev, [node.getAttribute('data-key')]: undefined};
  }

  render() {
    const prev = this._prev || {};
    const split = this._time || {};
    const classFor = (x) => {
      return split[x] !== prev[x] && prev[x] !== undefined ? 'anim' : '';
    };

    return html`
<style>${_style`village-countdown`}</style>
<main>
  <h2>${_msg`countdown_until`}</h2>
  <div class="counter" @animationend=${this._animationEnd}>
    <div class="counter-box ${classFor('days')}" data-key="days">
      <div class="holder active">${pad(split.days)}</div>
      <div class="holder prev">${pad(prev.days)}</div>
      <h2 class="bottom">${_msg`countdown_days`}</h2>
    </div>
    <div class="counter-box ${classFor('hours')}" data-key="hours">
      <div class="holder active">${pad(split.hours)}</div>
      <div class="holder prev">${pad(prev.hours)}</div>
      <h2 class="bottom">${_msg`countdown_hours`}</h2>
    </div>
    <div class="counter-box ${classFor('minutes')}" data-key="minutes">
      <div class="holder active">${pad(split.minutes)}</div>
      <div class="holder prev">${pad(prev.minutes)}</div>
      <h2 class="bottom">${_msg`countdown_minutes`}</h2>
    </div>
    <div class="counter-box ${classFor('seconds')}" data-key="seconds">
      <div class="holder active">${pad(split.seconds)}</div>
      <div class="holder prev">${pad(prev.seconds)}</div>
      <h2 class="bottom">${_msg`countdown_seconds`}</h2>
    </div>
  </div>
</main>
    `;
  }
}

customElements.define('village-countdown', VillageCountdownElement);
