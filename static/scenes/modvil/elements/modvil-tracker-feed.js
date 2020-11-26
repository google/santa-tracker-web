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

  get curr() {
    return this._options[this._count];
  }

  next() {
    ++this._count;
    if (this._count >= this._options.length) {
      const last = this._options[this._options.length - 1];
      this._options.sort(() => Math.random() - 0.5);
      if (this._options[0] === last) {
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
      _mainNode: {type: Object},
      stops: {type: Array},
    };
  }

  constructor() {
    super();

    this._chooser = new ItemChooser(feed.cards);
    this._done = Promise.resolve();  // can choose next right away
    this._mainNode = document.createElement('main');
    this._visitedStops = new Set();
    this._specialForStop = [];
  }

  shouldUpdate(changedProperties) {
    if (changedProperties.has('stops')) {
      this._visitedStops = new Set(this.stops || []);

      const lastStop = this.stops.slice(-1)[0] || null;
      this._specialForStop = [];

      // Find any special cards for this new, last stop.
      for (const cand in feed.limit) {
        const stop = feed.limit[cand];
        if (stop === lastStop) {
          this._specialForStop.push(cand);
        }
      }
      this._specialForStop.sort(() => Math.random() - 0.5);
    }
    return true;
  }

  async runner() {
    let failure = 0;
    let last = null;

    for (;;) {
      if (!this.isConnected) {
        return;
      }

      // Use any pending special cards, or the default mechanism. Don't show the same twice.
      let choice = this._specialForStop.pop() || this._chooser.next();
      if (choice === last) {
        continue;
      }
      last = choice;

      const requiredStop = feed.limit[choice];
      if (requiredStop && !this._visitedStops.has(requiredStop)) {
        // Skip as we're not yet past this stop.
        continue;
      }

      const url = `https://firebasestorage.googleapis.com/v0/b/santa-api.appspot.com/o/feed%2F${encodeURIComponent(choice)}?alt=media`;
      const {promise} = prepareAsset(url);
      const asset = await (promise.catch(() => null));
      if (asset === null) {
        ++failure;
        await promises.timeout(800 * Math.pow(2, failure / 2));  // don't fetch constnatly
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
        const duration = 6000 * Math.random() + 6000;
        this._done = promises.timeout(duration);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();

    Promise.resolve().then(async () => {
      for (;;) {
        try {
          await this.runner();
        } catch (e) {
          console.warn('feed runner failed', e);
          continue;
        }
        break;
      }
    });
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