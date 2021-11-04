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
import styles from './modvil-tracker.css';
import {_static, _msg} from '../../../src/magic.js';
import * as common from '../../../src/core/common.js';
import loadMaps from '../../../src/deps/maps.js';
import mapstyles from '../../../src/deps/mapstyles.json';
import '../../../src/elements/santa-santa.js';
import '../../../src/elements/santa-button.js';
import {localStorage} from '../../../src/storage.js';
import './modvil-tracker-feed.js';
import './modvil-tracker-stats.js';
import './modvil-tracker-photos.js';
import {elementMapsOverlay, StopManager, DataManager, northpoleLocation, fetchRoute} from './maputils.js';


common.preload.images(
  _static`img/tracker/marker.png`,
  _static`img/tracker/northpole.png`,
);


const focusTimeoutDelay = 20 * 1000;  // refocus on Santa after this much inactivity


// The jitter ratio is stored for the current browser window, so if users reload, they'll see Santa
// "jittered" by the same amount. This lets us randomly skew Santa through the route via Firebase,
// in case Maps is having a bad time.
if (!localStorage['routeJitter']) {
  localStorage['routeJitter'] = (Math.random() * 2) - 1;  // between [-1,+1]
}
const routeJitterRatio = +localStorage['routeJitter'] || 0;


class ModvilTrackerElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      _width: {type: Number},
      destinations: {type: Array},
      now: {type: Number},
      _ready: {type: Boolean},
      _focusOnSanta: {type: Boolean},
      _stops: {type: Array},
      _temporaryDestination: {type: Object},
      trackerOffset: {type: Number, attribute: 'tracker-offset'},
      // nb. _details isn't here as it changes only based on now/destinations
    };
  }

  constructor() {
    super();

    this.trackerOffset = 0;
    this.routeJitter = 0;  // in seconds

    this._map = null;
    this._dataManager = null;
    this._stopManager = null;
    this._details = null;
    this._closestArrival = 0;

    this._focusOnSanta = true;
    this._focusTimeout = 0;
    this._duringMapChange = false;
    this._duringResize = false;
    this._width = 0;

    this._mapNode = document.createElement('div');
    this._mapNode.classList.add('map');
    this._santaNode = document.createElement('santa-santa');
    this._infoNode = document.createElement('div');  // until replaced later
    this._photosNode = document.createElement('div');  // until replaced later

    this._preparePromise = this.prepareMaps().then(() => {
      this._ready = true;

      const tilesPromise = new Promise((resolve) => {
        const listener = this._map.addListener('tilesloaded', () => {
          google.maps.event.removeListener(listener);
          resolve();
        });
      });
      const timeoutPromise = new Promise((r) => window.setTimeout(r, 1500));

      return Promise.race([tilesPromise, timeoutPromise]);

    }).catch((err) => {
      console.error('failed to build modvil-tracker', err)
    });
    common.preload.wait(this._preparePromise);

    const updateNow = () => {
      const jitter = routeJitterRatio * this.routeJitter * 1000;  // adjust to ms
      this.now = +new Date() + this.trackerOffset + jitter;
    };
    updateNow();
    window.setInterval(updateNow, 1000);

    this._onWindowResize = this._onWindowResize.bind(this);
  }

  _onWindowResize() {
    this._duringResize = true;

    window.requestAnimationFrame(() => {
      this._duringResize = false;
      this._width = window.innerWidth;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._onWindowResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._onWindowResize);
  }

  focusOnSanta() {
    this._focusOnSanta = true;
  }

  shouldUpdate(changedProperties) {
    if (!this._ready) {
      return true;
    }

    if (changedProperties.has('_ready') || changedProperties.has('_width')) {
      const mobileMode = (this._width <= 600);
      this._map.setOptions({
        gestureHandling: mobileMode ? 'none' : 'auto',
        zoomControl: !mobileMode,
      });

      // Force immediate focus on Santa, since you can't leave it in this mode.
      if (mobileMode) {
        this._focusOnSanta = true;
        window.clearTimeout(this._focusTimeout);
      }

      // Set the fake control to a height of the infoNode.
      const bounds = this._infoNode.getBoundingClientRect();
      this._infoOffsetNode.style.height = `${bounds.height}px`;
    }

    if (changedProperties.has('_focusOnSanta')) {
      window.clearTimeout(this._focusTimeout);

      if (!this._focusOnSanta) {
        this._focusTimeout = window.setTimeout(() => {
          this._focusOnSanta = true;
        }, focusTimeoutDelay);
      } else {
        this._temporaryDestination = null;
      }
    }

    if (changedProperties.has('_ready') || changedProperties.has('destinations')) {
      this._stopManager.destroy();  // clear previous stop data

      this._dataManager = new DataManager(this.destinations || []);
      this._dataManager.now = this.now;
      this._stopManager = new StopManager(this._map, this._dataManager, this._onMarkerClick.bind(this));
      this._stopManager.update();

      // Find the nearest stop to the user.
      this._closestArrival = this._dataManager.closestArrival(this._userLocation);

    } else if (changedProperties.has('_ready') || changedProperties.has('now')) {
      this._dataManager.now = this.now;
      this._stopManager.update();
    } else if (changedProperties.has('_focusOnSanta') && this._focusOnSanta) {
      // ok
    } else {
      return true;
    }

    const details = this._dataManager.details;
    this._santaOverlay.position = new google.maps.LatLng(details.location.lat, details.location.lng);
    this._santaNode.heading = details.heading;
    this._santaNode.stop = details.stop;
    this._santaNode.hidden = details.home;
    this._details = details;

    // Optionally update stops, for feed images. Check if length is unexpected and run.
    if ((this._stops || []).length !== details.visibleTo + 1) {
      this._stops = (this.destinations || []).slice(0, details.visibleTo + 1).map(({id}) => id);
    }

    if (this._focusOnSanta) {
      let offset = details.stop ? 1 : 0;
      if (details.home) {
        offset = -10;  // zoom as far out as possible here
      }
      this._setLocation(this._santaOverlay.position, offset);
    }
    return true;
  }

  /**
   * @param {google.maps.LatLng} location
   * @param {number} offset zoom offset to use
   */
  _setLocation(location, offset) {
    try {
      this._duringMapChange = true;
      let usableMap = this._infoNode.offsetTop;

      if (this._photosNode.open) {
        usableMap -= 100;  // FIXME: random value
      }
      if (this._width > 600) {
        usableMap += 40;  // heading
      }

      // TODO(samthor): this is left over from the old codebase, but works fine.
      // If focused, the zoom is roughly inverse with screen size. Smaller devices see more of the
      // Earth, because they have less context around Santa.
      const min = (Math.min(1024, window.innerWidth) + usableMap) / 2;
      let zoom = Math.round(min / 160) + offset;
      zoom = Math.max(2, Math.min(6, zoom));

      const shift = this.offsetHeight - usableMap;
      const bounds = new google.maps.LatLngBounds(location, location);

      // nb. This order is pretty specific, otherwise we lose the center.
      this._map.fitBounds(bounds);
      this._map.setZoom(zoom);
      this._map.panBy(0, shift / 2);

    } finally {
      this._duringMapChange = false;
    }
  }

  _onMarkerClick(id) {
    window.ga('send', 'event', 'tracker', 'click', 'marker');
    if (this.width <= 600) {
      return;  // ignore click, mobile UI
    }

    const cand = this._dataManager.stop(id);
    if (!cand) {
      return;  // some problem with data
    } else if (this.stop === cand) {
      this._focusOnSanta = true;
      return;  // clicked on latest stop
    }

    // Temporarily focus on the place you clicked on.
    this._focusOnSanta = false;
    this._temporaryDestination = cand;
    this._setLocation(this._temporaryDestination.location, 2);
  }

  get details() {
    return this._details;
  }

  get stop() {
    if (this._details === null) {
      return null;
    }
    return this._dataManager.stop(this._details.visibleTo);
  }

  async prepareMaps() {
    const userLocation = Promise.resolve().then(async () => {
      const r = await fetch('https://santa-api.appspot.com/info?client=web');
      const data = await r.json();
      const raw = data.location.split(',');
      return {lat: +raw[0], lng: +raw[1]};
    });

    await loadMaps();

    this._map = new google.maps.Map(this._mapNode, {
      center: northpoleLocation,
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,  // ROK has own tiles at 7+
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      backgroundColor: '#8ee0dd',
      styles: mapstyles,
      scrollwheel: false,
      // nb. breaks our follow logic
      // restriction: {
      //   latLngBounds: {
      //     east: +180,
      //     north: +88,  // nb. this is >85 to support easy view of Santa's village
      //     south: -85,
      //     west: -180,
      //   },
      //   strictBounds: true,
      // },
    });

    this._santaOverlay = elementMapsOverlay();
    this._santaOverlay.setMap(this._map);
    this._santaOverlay.container.append(this._santaNode);
    this._santaNode.addEventListener('click', () => this._focusOnSanta = true);

    this._santaOverlay.position = new google.maps.LatLng(northpoleLocation.lat, northpoleLocation.lng);
    this._santaNode.heading = -90;

    const reset = (reason) => {
      if (!this._duringMapChange && !this._duringResize && this._focusOnSanta) {
        this._focusOnSanta = false;
        console.warn('removing focus', reason);
        window.ga('send', 'event', 'tracker', 'map', reason);
      }
    };
    this._map.addListener('center_changed', () => reset('move'));
    this._map.addListener('zoom_changed', () => reset('zoom'));

    this._dataManager = new DataManager([]);
    this._stopManager = new StopManager(null, this._dataManager);

    this._userLocation = await userLocation.catch((err) => {
      console.error('failed to get user location', err);
      return null;
    });

    this._infoOffsetNode = document.createElement('span');
    this._infoOffsetNode.style.height = '100px';
    this._map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(this._infoOffsetNode);
  }

  render() {
    const destination = this._temporaryDestination || this._details && this._details.raw || null;
    return html`
<div class="outer">
  <div class="top">
    <h1>${_msg`santatracker`}</h1>
  </div>
  ${this._mapNode}
  <div class="overflow">
    <div class="info">
      <div class="explore">
        <div class="row">
          <modvil-arrow dir="down" target="village">${_msg`explore`}</modvil-arrow>
        </div>
      </div>
      <modvil-tracker-feed .stops=${this._stops}></modvil-tracker-feed>
      <modvil-tracker-stats .details=${this._details} .arrivalTime=${this._closestArrival - this.now}></modvil-tracker-stats>
      <modvil-tracker-photos .destination=${destination}></modvil-tracker-photos>
    </div>
  </div>
  <div class="buttons">
    <santa-button color="green" class=${this._focusOnSanta ? 'gone' : ''} @click=${this._onFocusSantaClick}>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 257.22 139.5"><defs><style>.cls-1,.cls-3{fill:#fff;}.cls-1,.cls-4{stroke:#f9f9f9;stroke-miterlimit:10;}.cls-2{fill:#e53935;}.cls-4{fill:none;}</style></defs><title>hat_santa</title><g id="Layer_2" data-name="Layer 2"><g id="ART"><path class="cls-1" d="M55.9,28.21A27.7,27.7,0,1,1,28.21.5,27.69,27.69,0,0,1,55.9,28.21Z"/><path class="cls-2" d="M68.45,28.2l-1,0V139H242.87C242.87,77.8,164.78,28.2,68.45,28.2Z"/><rect class="cls-3" x="44.36" y="83.6" width="212.36" height="55.4" rx="16.37" ry="16.37"/><rect class="cls-4" x="44.36" y="83.6" width="212.36" height="55.4" rx="16.37" ry="16.37"/></g></g></svg>
    </santa-button>
  </div>
  <div id="top-divider"></div>
</div>
`;
  }

  firstUpdated() {
    this._infoNode = this.renderRoot.querySelector('.info') || this._infoOffsetNode;
    this._photosNode = this.renderRoot.querySelector('modvil-tracker-photos') || this._photosNode;
  }

  _onFocusSantaClick() {
    this._focusOnSanta = true;
    ga('send', 'event', 'tracker', 'click', 'focus-santa');
  }
}

customElements.define('modvil-tracker', ModvilTrackerElement);
