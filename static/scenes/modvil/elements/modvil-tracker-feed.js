import {LitElement, html} from "lit-element";
import styles from './modvil-tracker-feed.css';
import {_static, _msg} from '../../../src/magic.js';
import feed from './feed.json';
import {prepareAsset} from '../../../src/lib/media.js';
import * as promises from '../../../src/lib/promises.js';


class ItemChooser {
  constructor(options) {
    this._options = options.slice();
    this._options.sort(() => Math.random() - 0.5);
    this._count = 0;
  }

  next() {
    ++this._count;
    if (this._count >= this._options.length) {
      last = this._options[this._options.length - 1];
      this._options.sort(() => Math.random() - 0.5);
      if (this.options[0] === last) {
        this._count = 1;
      } else {
        this._count = 0;
      }
    }

    return this._options[this._count];
  }
}


class ModvilTrackerFeedElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      _imageNode: {type: Object},
    };
  }

  constructor() {
    super();

    this._chooser = new ItemChooser(feed.cards);
    this._done = Promise.resolve();  // can choose next right away
    this._mainNode = document.createElement('div');

    Promise.resolve().then(async () => {
      for (;;) {
        try {
          await this.runner();
        } catch (e) {
          console.warn('feed runner failed', e);
        }
      }
    });
  }

  async runner() {
    let failure = 0;

    for (;;) {
      const choice = this._chooser.next();

      const url = `https://firebasestorage.googleapis.com/v0/b/santa-api.appspot.com/o/feed%2F${encodeURIComponent(choice)}?alt=media`;
      const {promise} = prepareAsset(url);
      const asset = await (promise.catch(() => null));
      if (asset === null) {
        ++failure;
        await promises.timeout(400 * Math.pow(2, failure / 2));  // don't fetch constnatly
        continue;
      }
      failure = 0;

      if (asset instanceof HTMLMediaElement) {
        asset.loop = false;
      }
      asset.classList.add('asset');

      await new Promise((r) => window.requestAnimationFrame(r));
      await this._done;
      Array.from(this._mainNode.children).forEach((node) => {
        node.classList.add('gone');
        node.addEventListener('transitionend', () => node.remove());
      });
      asset.classList.add('appear');
      this._mainNode.append(asset);
      asset.offsetLeft;
      asset.classList.remove('appear');

      if (asset instanceof HTMLMediaElement) {
        const duration = parseInt(asset.duration) * 1000 || 4000;

        // Finish when the video is over, or its duration passed (for safety).
        this._done = Promise.race([
          promises.timeout(duration * 2),
          new Promise((r) => asset.addEventListener('ended', r)),
        ]);
      } else {
        const duration = 4000 * Math.random() + 4000;
        this._done = promises.timeout(duration);
      }
    }
  }

  render() {
    return html`
<div class="outer">
  <div class="title">
  <big>&bull;</big>
    <h1>${_msg`tracker_feed`}</h1>
  </div>
  ${this._mainNode}
</div>
    `;
  }
}

customElements.define('modvil-tracker-feed', ModvilTrackerFeedElement);