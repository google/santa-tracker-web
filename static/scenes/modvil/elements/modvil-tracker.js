import {LitElement, html} from "lit-element";
import styles from './modvil-tracker.css';
import {_static} from '../../../src/magic.js';
import loadMaps from '../../../src/deps/maps.js';
import mapstyles from '../../../src/deps/mapstyles.json';
import * as common from '../../../src/core/common.js';


const scenePath = _static`scenes/modvil`;


const urls = [
  // 'img/chimney1.gif',
  // 'img/chimney2.gif',
  // 'img/marker.png',
  // 'img/northpole.png',
  'img/sleigh/effects.svg',
];
'n ne e se s sw w nw'.split(/\s+/g).forEach((dir) => {
  urls.push(`img/sleigh/sleigh-${dir}-back.svg`);
  urls.push(`img/sleigh/sleigh-${dir}-front.svg`);
  urls.push(`img/sleigh/sleigh-${dir}-santa.svg`);
});

common.preload.assets(...urls.map((raw) => `${scenePath}/${raw}`));


class ModvilTracker extends LitElement {
  static get styles() { return [styles]; }

  constructor() {
    super();

    this._map = null;
    this._mapNode = document.createElement('div');
    this._mapNode.classList.add('map');
    this._preparePromise = this.prepareMaps();
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
