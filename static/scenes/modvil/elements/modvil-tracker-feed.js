import {LitElement, html} from "lit-element";
import styles from './modvil-tracker-feed.css';
import {_static, _msg} from '../../../src/magic.js';
import feed from './feed.json';
import {prepareAsset} from '../../../src/lib/media.js';


const avoidRecent = 10;


class ModvilTrackerFeedElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      _imageNode: {type: Object},
    };
  }

  _prepare(videoAllowed = true) {
    let choice = '';
    for (let i = 0; i < 20; ++i) {
      choice = feed.cards[~~(Math.random() * feed.cards.length)];
      if (!this._recent.has(choice) && (videoAllowed || !choice.includes('.mp4'))) {
        break;
      }
    }
    if (!choice) {
      return '';
    }

    this._recent.add(choice);
    while (this._recent.size > avoidRecent) {
      for (const x of this._recent) {
        this._recent.delete(x);
        break;
      }
    }

    const url = `https://firebasestorage.googleapis.com/v0/b/santa-api.appspot.com/o/feed%2F${encodeURIComponent(choice)}?alt=media`;
    const {promise} = prepareAsset(url);
    return promise;
  }

  constructor() {
    super();
    this._recent = new Set();
    this._timeout = 0;
  }

  connectedCallback() {
    super.connectedCallback();

    const run = () => {
      this._prepare().then((asset) => {
        asset.classList.add('asset');
        this._imageNode = asset;
        return asset;
      }).catch((err) => {
        console.warn('failed to load', err);
        return null;
      }).then((asset) => {
        let timeout = asset ? 7500 : 2500;

        if (asset instanceof HTMLVideoElement) {
          timeout = asset.duration * 1000;
        }

        if (this.isConnected) {
          this._timeout = window.setTimeout(run, timeout);
        }
      });
    };

    run();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.clearTimeout(this._timeout);
  }

  render() {
    return html`
<div class="outer">
  <div class="title">
  <big>&bull;</big>
    <h1>${_msg`tracker_feed`}</h1>
  </div>
  ${this._imageNode || ''}
</div>
    `;
  }
}

customElements.define('modvil-tracker-feed', ModvilTrackerFeedElement);