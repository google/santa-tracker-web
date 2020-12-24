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
import styles from './modvil-tracker-photos.css';
import * as common from '../../../src/core/common.js';
import {_static, _msg} from '../../../src/magic.js';
import {prepareAsset} from '../../../src/lib/media.js';
import * as promises from '../../../src/lib/promises.js';
import './modvil-tracker-photo.js';


common.preload.images(
  _static`img/tracker/localguides.svg`,
);


const defaultAssetCount = 4;
const displayPhotoCount = 4;
const delayPhotoLoad = 750;


function chooseDefaultAsset() {
  const defaultPhotoAsset = _static`img/tracker/default`;
  const count = Math.floor(Math.random() * defaultAssetCount)
  return defaultPhotoAsset + count + '.png';
}

const sizeTarget = `=w480`;  // This is different than other clients, but matches the size
const sizingRegexp = /(=\w\d+|)$/;

const lhHostnameRegexp = /^lh\d+\.googleusercontent\.com$/

/**
 * Process the raw URL from either route data or the feed JSON, and generate a useful URL for an
 * image to load, including downsizing the asset.
 *
 * @param {string} url
 * @return {string}
 */
const urlForPhoto = (url) => {
  const lhServer = Math.random() < 0.5 ? 3 : 5;
  const urlBase = `https://lh${lhServer}.googleusercontent.com`;

  const u = new URL(url, urlBase);
  if (lhHostnameRegexp.test(u.hostname) || u.origin === urlBase) {
    // This is a configurable URL.
    u.pathname = u.pathname.replace(sizingRegexp, sizeTarget)
  }

  return u.toString();
};


function preparePhoto({url, attributionHtml, lg}) {
  const node = document.createElement('modvil-tracker-photo');
  node.attributionHtml = attributionHtml;
  node.brand = lg;

  url = urlForPhoto(url);

  const {asset, promise} = prepareAsset(url);
  node.append(asset);
  return promise.then(() => node).catch((err) => null);
}


function boundsDelta(a, b) {
  const mid = (bounds) => {
    return {
      x: (bounds.left + bounds.right) / 2,
      y: (bounds.top + bounds.bottom) / 2,
    }
  };
  const am = mid(a);
  const bm = mid(b);

  const sx = (a.width / b.width);
  const sy = (a.height / b.height);

  return `translate(${am.x - bm.x}px, ${am.y - bm.y}px) scale(${sx}, ${sy})`
}


class ModvilTrackerStatsElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      open: {type: Boolean, reflect: true},
      destination: {type: Object},
      _previousDestination: {type: Object},
      _photoReady: {type: Boolean},  // are any photos for current details ready
    };
  }

  constructor() {
    super();
    this._photoNode = document.createElement('div');
    this._photoNode.classList.add('photos');

    this._photoNode.addEventListener('transitionend', (ev) => {
      const node = ev.target;
      if (node.localName !== 'modvil-tracker-photo') {
        return;
      }
      node.toggleAttribute('large', this.open);
    });
  }

  shouldUpdate(changedProperties) {
    if (changedProperties.has('open')) {

      // Determine current position.
      const all = Array.from(this._photoNode.children).map((node) => {
        const {transform} = window.getComputedStyle(node);
        node.style.transform = 'none';
        const bounds = node.getBoundingClientRect();
        return {node, bounds, transform};
      });

      // Toggle UI state, moving actual nodes.
      this._photoNode.classList.toggle('open', this.open);

      // Transform back to previous location, including previous transform.
      all.forEach(({node, bounds, transform}) => {
        if (transform === 'none') {
          transform = '';  // special-case "none" as it's not additive
        }
        const updated = node.getBoundingClientRect();
        node.style.transform = `${boundsDelta(bounds, updated)} ${transform}`;
      });

      // Force zero-transform to previous location by reinserting.
      all.forEach(({node}) => {
        this._photoNode.append(node);
        node.offsetLeft;  // and forcing layout, important
        node.style.transform = null;
      });

      // Extra control.
      if (!this.open) {
        all.forEach(({node}) => node.removeAttribute('large'));
      }
    }

    if (!changedProperties.has('destination')) {
      return true;
    }

    this._photoReady = false;
    this._previousDestination = changedProperties.get('destination');

    const photos = this.destination && this.destination.details && this.destination.details.photos || [];
    this.photosTask(this.destination, photos);

    return true;
  }

  _removePhoto(node) {
    if (!node) {
      return;
    }
    node.setAttribute('destroy', '');
    window.setTimeout(() => node.remove(), delayPhotoLoad / 2);
  }

  async photosTask(d, photos) {
    const previous =
        Array.from(this._photoNode.children).filter((node) => !node.hasAttribute('destroy'));
    let count = displayPhotoCount;

    // These are the ~displayPhotoCount positions that each photo can be in (for open mode), that
    // aren't already used by previous nodes.
    const positions = new Set();
    for (let i = 0; i < displayPhotoCount; ++i) {
      positions.add('' + i);
    }
    previous.forEach((node) => positions.delete(node.getAttribute('data-position')));

    photos = photos.slice();  // don't clobber real data

    // Insert four fake photos in case we need them.
    for (let i = 0; i < displayPhotoCount; ++i) {
      photos.push({url: chooseDefaultAsset()});
    }

    // Reverse the first ~count photos, AND the remaining photos. This means we request in reverse
    // and ideally end up with the best being the most visible.
    const firstCount = photos.splice(0, count);
    photos.reverse();
    firstCount.reverse();
    photos.splice(0, 0, ...firstCount);

    // Request a random ~4 photos. If any fail, request more.
    while (photos.length && count) {
      const p = preparePhoto(photos.shift());
      const delay = promises.timeout(delayPhotoLoad);
      const node = await p;
      await delay;

      if (this.destination !== d) {
        return false;  // preempt
      }
      if (node === null) {
        continue;  // try another
      }

      this._photoReady = true;  // we have a photo ready at all, show title
      --count;

      let photoToReplace = null;
      if (this._photoNode.children.length >= displayPhotoCount) {
        photoToReplace = previous.pop();
      }
      this._removePhoto(photoToReplace);

      // Steal the position of the photo we're replacing.
      if (photoToReplace) {
        node.setAttribute('data-position', photoToReplace.getAttribute('data-position'));
      }

      // Or find one from the spare position buffer.
      if (!node.getAttribute('data-position')) {
        for (const v of positions) {
          node.setAttribute('data-position', v);
          positions.delete(v);
          break;
        }
        if (!node.getAttribute('data-position')) {
          // Should never happen :(
          console.warn('no known order for new photo', node);
        }
      }

      node.toggleAttribute('large', !!this.open);
      node.setAttribute('appear', '');
      this._photoNode.prepend(node);
      await node.updateComplete;
      await new Promise((resolve) => {
        window.requestAnimationFrame(() => {
          node.removeAttribute('appear');
          resolve();
        });
      });
    }

    // We finished updating to a new location. Remove any remaining (e.g. a place with ~2 photos).
    // TODO(samthor): We could fill four photos just with dummy social images.
    previous.forEach((node) => {
      this._removePhoto(node);
    });
  }

  render() {
    const d = (this._photoReady ? this.destination : this._previousDestination) || {};

    return html`
<div class="outer">
  ${this._photoNode}

  <div class="view-closed">
    <div class="title ${this._photoReady ? '' : 'gone'}">
      <h1>${d.city}</h1>
      <h2>${d.region}</h2>
    </div>
    <button class="hint button-open" @click=${() => this.open = true}></button>
  </div>
  <div class="view-open">
    <button class="hint button-close" @click=${() => this.open = false}></button>
    <div class="top">
      <div class="title ${this._photoReady ? '' : 'gone'}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>
        <h1>${d.city}, ${d.region}</h1>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </div>
  </div>
</div>
    `;
  }
}

customElements.define('modvil-tracker-photos', ModvilTrackerStatsElement);