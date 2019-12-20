import {LitElement, html} from "lit-element";
import styles from './modvil-tracker.css';
import {_static} from '../../../src/magic.js';
import * as common from '../../../src/core/common.js';
import loadMaps from '../../../src/deps/maps.js';
import mapstyles from '../../../src/deps/mapstyles.json';
import '../../../src/elements/santa-santa.js';
import {elementMapsOverlay, StopManager, DataManager, northpoleLocation} from './maputils.js';


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
    };
  }

  constructor() {
    super();

    this._map = null;
    this._dataManager = null;
    this._stopManager = null;

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
    Promise.resolve().then(async () => {
      const r = await fetch('https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media');
      const data = await r.json();
      this.destinations = data['destinations'];
    });
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
    } else if (changedProperties.has('_ready') || changedProperties.has('now')) {
      this._dataManager.now = this.now;
      this._stopManager.update();
    } else {
      return true;
    }

    const details = this._dataManager.details;
    console.info('details', details);
    this._santaOverlay.position = new google.maps.LatLng(details.location.lat, details.location.lng);
    this._santaNode.heading = details.heading;
    this._santaNode.stop = details.stop;
    this._santaNode.hidden = details.home;

    return true;
  }

  get details() {
    return this._dataManager.details;
  }

  async prepareMaps() {
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
      }
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
  }

  render() {
    return html`${this._mapNode}`;
  }
}

customElements.define('modvil-tracker', ModvilTracker);
