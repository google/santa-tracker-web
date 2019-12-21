import {LitElement, html} from "lit-element";
import styles from './modvil-tracker-photos.css';
import * as common from '../../../src/core/common.js';
import {_static, _msg} from '../../../src/magic.js';
import {prepareAsset} from '../../../src/lib/media.js';
import * as promises from '../../../src/lib/promises.js';


common.preload.images(
  _static`img/tracker/localguides.svg`,
);


const defaultPhotoAsset = _static`img/tracker/default.png`;
const displayPhotoCount = 4;


function preparePhoto({url}) {
  const node = document.createElement('div');
  node.classList.add('photo');
  const {asset, promise} = prepareAsset(url);

  node.append(asset);
  return promise.then(() => node).catch((err) => null);
}


class ModvilTrackerStatsElement extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      destination: {type: Object},
      _previousDestination: {type: Object},
      _photoReady: {type: Boolean},  // are any photos for current details ready
    };
  }

  constructor() {
    super();
    this._photoNode = document.createElement('div');
    this._photoNode.classList.add('photos');
  }

  shouldUpdate(changedProperties) {
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
    node.classList.add('gone');
    node.addEventListener('transitionend', () => node.remove());
  }

  async photosTask(d, photos) {
    const previous = Array.from(this._photoNode.children);
    let count = displayPhotoCount;

    photos = photos.slice();  // don't clobber real data
    count = Math.max(1, Math.min(photos.length, count));
    photos.push({url: defaultPhotoAsset});

    // Reverse the first ~count photos, AND the remaining photos. This means we request in reverse
    // and ideally end up with the best being the most visible.
    const firstCount = photos.splice(0, count);
    photos.reverse();
    firstCount.reverse();
    photos.splice(0, 0, ...firstCount);

    // Request a random ~4 photos. If any fail, request more.
    while (photos.length && count) {
      const p = preparePhoto(photos.shift());
      const delay = promises.timeout(750);
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

      node.classList.add('gone');
      this._photoNode.prepend(node);
      node.offsetLeft;
      node.classList.remove('gone');

      if (this._photoNode.children.length > displayPhotoCount) {
        this._removePhoto(previous.pop());
      }
    }

    // remove all remaining
    previous.forEach((node) => this._removePhoto(node));
  }

  render() {
    const d = (this._photoReady ? this.destination : this._previousDestination) || {};

    return html`
<div class="outer">
  ${this._photoNode}

  <div class="title ${this._photoReady ? '' : 'gone'}">
    <h1>${d.city}</h1>
    <h2>${d.region}</h2>
  </div>
</div>
    `;
  }
}

customElements.define('modvil-tracker-photos', ModvilTrackerStatsElement);