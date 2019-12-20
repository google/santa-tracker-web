import {LitElement, html} from "lit-element";
import styles from './modvil-tracker.css';
import {_static} from '../../../src/magic.js';
import * as common from '../../../src/core/common.js';
import loadMaps from '../../../src/deps/maps.js';
import mapstyles from '../../../src/deps/mapstyles.json';
import '../../../src/elements/santa-santa.js';
import './modvil-tracker-stats.js';
import {elementMapsOverlay, StopManager, DataManager, northpoleLocation, fetchRoute} from './maputils.js';


common.preload.images(
  _static`img/tracker/marker.png`,
  _static`img/tracker/northpole.png`,
);


class ModvilTracker extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      destinations: {type: Array},
      now: {type: Number},
      _ready: {type: Boolean},
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

    this._mapNode = document.createElement('div');
    this._mapNode.classList.add('map');
    this._santaNode = document.createElement('santa-santa');

    this._preparePromise = this.prepareMaps().then(() => {
      this._ready = true;
    }).catch((err) => {
      console.error('failed to build modvil-tracker', err)
    });
    common.preload.wait(this._preparePromise);

    // FIXME: for testing
    fetchRoute('https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media').then((destinations) => {
      this.destinations = destinations;
    });
    this.now = 1577192880000;

    window.setInterval(() => {
      this.now += 100;
    }, 100);
  }

  shouldUpdate(changedProperties) {
    if (!this._ready) {
      return true;
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
    } else {
      return true;
    }

    const details = this._dataManager.details;
    this._santaOverlay.position = new google.maps.LatLng(details.location.lat, details.location.lng);
    this._santaNode.heading = details.heading;
    this._santaNode.stop = details.stop;
    this._santaNode.hidden = details.home;
    this._details = details;

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
      restriction: {
        latLngBounds: {
          east: +180,
          north: +88,  // nb. this is >85 to support easy view of Santa's village
          south: -85,
          west: -180,
        },
        strictBounds: true,
      },
    });

    this._santaOverlay = elementMapsOverlay();
    this._santaOverlay.setMap(this._map);
    this._santaOverlay.container.append(this._santaNode);

    this._santaOverlay.position = new google.maps.LatLng(northpoleLocation.lat, northpoleLocation.lng);
    this._santaNode.heading = -90;

    this._map.addListener('center_changed', () => {
      // If it's not a map change or resize, reset focusOnSanta.
      // if (!this._duringMapChange && !this._duringResize) {
      //   this.focusOnSanta = false;
      //   this._delaySantaFocus();
//        window.ga('send', 'event', 'tracker', 'map', 'move');
      // }
    });

    this._dataManager = new DataManager([]);
    this._stopManager = new StopManager(null, this._dataManager);

    this._userLocation = await userLocation.catch((err) => {
      console.error('failed to get user location', err);
      return null;
    });
  }

  render() {
    return html`
<div class="outer">
  ${this._mapNode}
  <div class="info">
    <modvil-tracker-stats .details=${this.details} .arrivalTime=${this._closestArrival - this.now}></modvil-tracker-stats>
  </div>
</div>
`;
  }
}

customElements.define('modvil-tracker', ModvilTracker);
