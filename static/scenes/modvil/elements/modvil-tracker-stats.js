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


const PREFLIGHT_WINDOW_MS = 2 * 60 * 60 * 1000;  // 2 hours


function getPreflightActivity(timeUntilTakeoffMs) {
  if (timeUntilTakeoffMs > PREFLIGHT_WINDOW_MS) {
    return _msg`tracker_offline` || 'Offline';
  }
  const mins = timeUntilTakeoffMs / (60 * 1000);
  if (mins <= 0.5) return _msg`tracker_preflight_20` || 'Final countdown to liftoff! Hold on tight!';
  if (mins <= 1) return _msg`tracker_preflight_19` || 'Magic engines at max power, Santa grips the reins!';
  if (mins <= 2) return _msg`tracker_preflight_18` || 'Spreading magic dust over the reindeer primed for takeoff';
  if (mins <= 4) return _msg`tracker_preflight_17` || 'Sleigh lining up on the runway, bells jingling at full volume';
  if (mins <= 7) return _msg`tracker_preflight_16` || 'Takeoff clearance received from North Pole Tower';
  if (mins <= 10) return _msg`tracker_preflight_15` || 'Elves clearing runway snow & inspecting runway approach lights';
  if (mins <= 15) return _msg`tracker_preflight_14` || 'Santa boards the sleigh and completes the pre-flight checklist';
  if (mins <= 20) return _msg`tracker_preflight_13` || "Hitching all eight reindeer and Rudolph to Santa's sleigh";
  if (mins <= 26) return _msg`tracker_preflight_12` || 'Reindeer taxiing out of the stables to the taxiway';
  if (mins <= 33) return _msg`tracker_preflight_11` || 'Syncing world clocks to Greenwich Mean Time';
  if (mins <= 40) return _msg`tracker_preflight_10` || 'Calibrating the GPS (Global Present System) and star charts';
  if (mins <= 48) return _msg`tracker_preflight_9` || "Installing Rudolph's red nose guidance bulb and testing beacon";
  if (mins <= 56) return _msg`tracker_preflight_8` || 'Testing harness bells and audio communication system';
  if (mins <= 64) return _msg`tracker_preflight_7` || 'Feeding reindeer high-energy magic carrots and moss';
  if (mins <= 72) return _msg`tracker_preflight_6` || 'Grooming and brushing all nine reindeer';
  if (mins <= 80) return _msg`tracker_preflight_5` || 'Polishing sleigh runners and inspecting harness fittings';
  if (mins <= 90) return _msg`tracker_preflight_4` || 'Loading sleigh compartments: Europe, Americas, Asia, Africa & Oceania';
  if (mins <= 100) return _msg`tracker_preflight_3` || 'Wrapping final oversized and fragile presents';
  if (mins <= 110) return _msg`tracker_preflight_2` || 'Checking toy inventory against the Nice List';
  if (mins <= 120) return _msg`tracker_preflight_1` || "Loading Santa's sleigh with gifts from the main workshop";
  return _msg`tracker_offline` || 'Offline';
}


class ModvilTrackerStatsElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      details: {type: Object},
      arrivalTime: {type: Number},
      now: {type: Number},
    };
  }

  render() {
    const now = this.now || Date.now();
    const date = new Date(now);
    let year = date.getUTCFullYear();
    if (date.getUTCMonth() < 9) {
      year--;
    }
    const takeoffTime = Date.UTC(year, 11, 24, 10, 0, 0);
    const isBeforeTakeoff = now < takeoffTime;
    const d = {
      raw: {city: _msg`santasvillage` || "Santa's Village", region: 'North Pole'},
      home: isBeforeTakeoff,
      stop: true,
      presents: 0,
      distance: 0,
      ...this.details,
    };
    if (d.next === undefined) {
      d.next = Math.max(0, takeoffTime - now);
    }
    const arrivalTime = this.arrivalTime || 0;
    const showArrivalHours = (arrivalTime > 10 * 60 * 1000);  // don't show in last 10 minutes
    const isPreflight = isBeforeTakeoff && Boolean(d.home && (!d.presents || d.presents === 0));
    const isOffline = isPreflight && (d.next > PREFLIGHT_WINDOW_MS);

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

    const statusLabel = isPreflight ? (_msg`tracker_preflight_status` || 'Pre-Flight Status') : (showArrivalHours ? _msg`tracker_arrival` : _msg`tracker_distance_travelled`);
    const activityValue = isPreflight ? (isOffline ? (_msg`tracker_offline` || 'Offline') : getPreflightActivity(d.next)) : '';

    return html`
<div class="outer">
  <div class="grow">
    <h1>${statusLabel}</h1>
    <h2 class=${isPreflight ? 'preflight-activity' : ''}>${isPreflight ? activityValue : (showArrivalHours ? formatArrivalTime(arrivalTime) : formatNumber(Math.round(d.distance / 1000), 'km'))}</h2>
    <h1>${_msg`tracker_gifts_delivered`}</h1>
    <h2>${formatNumber(d.presents)}</h2>
  </div>
  <hr />
  <div class="sides grow">
    <div>
      <h1>${d.stop ? _msg`tracker_current_stop` : _msg`tracker_next_stop`}</h1>
      <div class="icon">
        ${stopIcon}
        <h2>${(d.raw && d.raw.city) || _msg`santasvillage` || "Santa's Village"}, ${(d.raw && d.raw.region) || "North Pole"}</h2>
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