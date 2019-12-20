import {LitElement, html} from "lit-element";
import styles from './modvil-tracker.css';
import {_static} from '../../../src/magic.js';
import * as common from '../../../src/core/common.js';
import loadMaps from '../../../src/deps/maps.js';
import mapstyles from '../../../src/deps/mapstyles.json';
import '../../../src/elements/santa-santa.js';
import {elementMapsOverlay} from './maputils.js';


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

    this._mapNode = document.createElement('div');
    this._mapNode.classList.add('map');
    this._santaNode = document.createElement('santa-santa');

    this._preparePromise = this.prepareMaps().then(() => {
      this._ready = true;
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
    const ready = changedProperties.has('_ready') && this._ready;

    if (ready || changedProperties.has('destinations')) {
      const destinations = this.destinations || [];

      // TODO: invalidate stuff
      console.info('got', destinations);
    }
    if (ready || changedProperties.has('now')) {
      // TODO: stuff
    }

    return true;
  }

  async prepareMaps() {
    await loadMaps();

    this._map = new google.maps.Map(this._mapNode, {
      center: {lat: 83.124668, lng: 154.891364},  // Santa's Village
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
          north: +85,  // nb. Could go further North to support Santa's Villagge
          south: -85,
          west: -180,
        },
        strictBounds: true,
      }
    });

    this._santaOverlay = elementMapsOverlay();
    this._santaOverlay.setMap(this._map);
    this._santaOverlay.container.append(this._santaNode);

    this._santaOverlay.position = new google.maps.LatLng(-33.85, 151.2);
    this._santaNode.heading = -78.2;

    this._map.addListener('center_changed', () => {
      // If it's not a map change or resize, reset focusOnSanta.
      // if (!this._duringMapChange && !this._duringResize) {
      //   this.focusOnSanta = false;
      //   this._delaySantaFocus();
//        window.ga('send', 'event', 'tracker', 'map', 'move');
      // }
    });
  }

  render() {
    return html`
${this._mapNode}
`;
  }
}

customElements.define('modvil-tracker', ModvilTracker);
