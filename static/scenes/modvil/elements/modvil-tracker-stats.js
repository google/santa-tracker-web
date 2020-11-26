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

import {LitElement, html} from "lit-element";
import styles from './modvil-tracker-stats.css';
import {_static, _msg} from '../../../src/magic.js';


function padDigits(x) {
  x = Math.round(x);
  return x < 10 ? `0${x}` : '' + x;
}


function formatDuration(ms) {
  if (!(ms >= 0)) {
    return '?';  // NaN check
  }

  let s = ms / 1000;

  const seconds = Math.floor(s) % 60;
  s /= 60;
  const mins = Math.floor(s) % 60;
  s /= 60;
  const hours = Math.floor(s) % 24;
  const days = Math.floor(s / 24);

  if (days > 365) {
    return `?`;
  } else if (days > 0) {
    return `${days}d`;
  }

  const parts = [padDigits(seconds)];
  if (hours) {
    parts.unshift(padDigits(hours), padDigits(mins));
  } else {
    parts.unshift(mins);
  }
  return parts.join(':');
}


function formatArrivalTime(ms) {
  const hours = ms / (60 * 60 * 1000);

  if (Math.round(hours) <= 1) {
    return _msg`tracker_time_from_you_one`;
  }

  let floor = Math.floor(hours);
  const frac = hours % 1;
  let suffix = '';
  if (frac > 0.75) {
    ++floor;
  } else if (frac > 0.25) {
    suffix = '½';
  }
  const value = floor + suffix;
  const raw = _msg`tracker_time_from_you_many`;
  return raw.replace('{{hours}}', value);
}


function formatNumber(v, suffix='') {
  if (!(v >= 0)) {
    return '?';
  }
  return new Number(v).toLocaleString() + suffix;
}


class ModvilTrackerStatsElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      details: {type: Object},
      arrivalTime: {type: Number},
    };
  }

  render() {
    const d = this.details || {raw: {}};
    const arrivalTime = this.arrivalTime || 0;
    const showArrivalHours = (arrivalTime > 10 * 60 * 1000);  // don't show in last 10 minutes

    // Choose a SVG icon for stop or "in transit".
    const stopIcon = d.stop ?
        html`
<svg width="10" height="13" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.1 3.60004C7.1 1.80004 5.6 0.300049 3.8 0.300049C2 0.300049 0.5 1.80004 0.5 3.60004C0.5 4.50004 0.8 5.20005 1.4 5.80005L3.9 8.90005L6.4 5.80005C6.7 5.30005 7.1 4.50004 7.1 3.60004ZM3.7 4.80005C3.1 4.80005 2.5 4.30004 2.5 3.60004C2.5 3.00004 3 2.40005 3.7 2.40005C4.3 2.40005 4.9 2.90004 4.9 3.60004C4.9 4.30004 4.3 4.80005 3.7 4.80005Z" fill="#FFFEAB"/>
</svg>
        ` :
        html`
<svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0.599609 8.59996H3.19961C4.19961 8.59996 4.99961 7.39995 4.99961 5.99995V5.29996C4.99961 3.89996 5.79961 2.69995 6.79961 2.69995H9.09961" stroke="#FFFEAB" stroke-width="2.2353" stroke-miterlimit="10"/>
  <path d="M8.39941 5.29996L12.8994 2.69995L8.39941 0.199951V5.29996Z" fill="#FFFEAB"/>
</svg>
        `;

    return html`
<div class="outer">
  <div class="grow">
    <h1>${showArrivalHours ? _msg`tracker_arrival` : _msg`tracker_distance_travelled`}</h1>
    <h2>${showArrivalHours ? formatArrivalTime(arrivalTime) : formatNumber(Math.round(d.distance / 1000), 'km')}</h2>
    <h1>${_msg`tracker_gifts_delivered`}</h1>
    <h2>${formatNumber(d.presents)}</h2>
  </div>
  <hr />
  <div class="sides grow">
    <div>
      <h1>${d.stop ? _msg`tracker_current_stop` : _msg`tracker_next_stop`}</h1>
      <div class="icon">
        ${stopIcon}
        <h2>${d.raw.city}, ${d.raw.region}</h2>
      </div>
    </div>
    <div>
      <h1>${d.stop ? _msg`tracker_departing_in` : _msg`tracker_arriving_in`}</h1>
      <h2>${formatDuration(d.next)}</h2>
    </div>
  </div>
</div>
    `;
  }
}

customElements.define('modvil-tracker-stats', ModvilTrackerStatsElement);