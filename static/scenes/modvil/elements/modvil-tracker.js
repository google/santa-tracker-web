import {LitElement, html} from "lit-element";
import styles from './modvil-tracker.css';
import {_static} from '../../../src/magic.js';
import * as common from '../../../src/core/common.js';
import loadMaps from '../../../src/deps/maps.js';
import mapstyles from '../../../src/deps/mapstyles.json';
import '../../../src/elements/santa-santa.js';
import '../../../src/elements/santa-button.js';
import './modvil-tracker-feed.js';
import './modvil-tracker-stats.js';
import './modvil-tracker-photos.js';
import {elementMapsOverlay, StopManager, DataManager, northpoleLocation, fetchRoute} from './maputils.js';


common.preload.images(
  _static`img/tracker/marker.png`,
  _static`img/tracker/northpole.png`,
);


const focusTimeoutDelay = 3 * 1000;  // refocus on Santa after this much inactivity


class ModvilTrackerElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      _width: {type: Number},
      destinations: {type: Array},
      now: {type: Number},
      _ready: {type: Boolean},
      _focusOnSanta: {type: Boolean},
      // nb. _details isn't here as it changes only based on now/destinations
    };
  }

  constructor() {
    super();

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

    // FIXME: for testing
    fetchRoute('https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media').then((destinations) => {
      this.destinations = destinations;
    });
    this.now = +new Date();

    window.setInterval(() => {
      this.now = +new Date();
    }, 1000);

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
      const infoNode = this._mapNode.nextElementSibling;
      const bounds = infoNode.getBoundingClientRect();
      this._infoOffsetNode.style.height = `${bounds.height}px`;
    }

    if (changedProperties.has('_focusOnSanta')) {
      window.clearTimeout(this._focusTimeout);

      if (!this._focusOnSanta) {
        this._focusTimeout = window.setTimeout(() => {
          this._focusOnSanta = true;
        }, focusTimeoutDelay);
      }
    }

    if (changedProperties.has('_ready') || changedProperties.has('destinations')) {
      this._stopManager.destroy();  // clear previous stop data

      this._dataManager = new DataManager(this.destinations || []);
      this._dataManager.now = this.now;
      this._stopManager = new StopManager(this._map, this._dataManager);
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

    if (!this._focusOnSanta) {
      return true;
    }

    try {
      this._duringMapChange = true;
      const infoNode = this._mapNode.nextElementSibling;
      let usableMap = infoNode.offsetTop;

      const photosNode = infoNode.parentNode.querySelector('modvil-tracker-photos');
      if (photosNode && photosNode.open) {
        usableMap -= 100;  // FIXME: random value
      }

      // TODO(samthor): this is left over from the old codebase, but works fine.
      // If focused, the zoom is roughly inverse with screen size. Smaller devices see more of the
      // Earth, because they have less context around Santa.
      const min = (window.innerWidth + usableMap) / 2;
      let zoom = Math.round(min / 160);
      if (details.stop) {
        zoom += 1;  // zoom in at cities
      }
      zoom = Math.max(2, Math.min(6, zoom));

      const shift = this.offsetHeight - usableMap;
      const bounds = new google.maps.LatLngBounds(this._santaOverlay.position, this._santaOverlay.position);

      // nb. This order is pretty specific, otherwise we lose the center.
      this._map.fitBounds(bounds);
      this._map.setZoom(zoom);
      this._map.panBy(0, shift / 2);

    } finally {
      this._duringMapChange = false;
    }

    return true;
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
    const destination = this.details && this.details.raw || null;
    return html`
<div class="outer">
  ${this._mapNode}
  <div class="info">
    <modvil-tracker-feed></modvil-tracker-feed>
    <modvil-tracker-stats .details=${this.details} .arrivalTime=${this._closestArrival - this.now}></modvil-tracker-stats>
    <modvil-tracker-photos .destination=${destination}></modvil-tracker-photos>
  </div>
  <div class="buttons">
    <santa-button class=${this._focusOnSanta ? 'gone' : ''} @click=${() => this._focusOnSanta = true}></santa-button>
  </div>
  <div id="top-divider"></div>
</div>
`;
  }
}

customElements.define('modvil-tracker', ModvilTrackerElement);
