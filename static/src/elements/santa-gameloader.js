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

import styles from './santa-gameloader.css';

import {dedup, resolvable} from '../lib/promises.js';

import {Loader, LoaderHandler} from 'iframe-load';
import {prepareMessage} from '../lib/iframe.js';



class PortControl {
  constructor() {
    this._port = null;
    this._done = false;
    this._attached = false;
    this._closed = false;

    this._nextPromise = null;
    this._nextResolve = null;
    this._q = [];
  }

  attach(port) {
    if (this._attached || this._done) {
      throw new Error('cannot attach twice');
    }
    if (port) {
      this._port = port;
      port.onmessage = (ev) => this.push(ev.data);
    } else {
      this._closed = true;
    }
    this._attached = true;
  }

  get hasPort() {
    return Boolean(this._port);
  }

  get isAttached() {
    return this._attached;
  }

  send(x) {
    if (this._port) {
      this._port.postMessage(x);
    }
  }

  shutdown() {
    if (this._done) {
      throw new Error('cannot shutdown twice');
    }

    this._done = true;
    this._attached = false;
    this.push(null);  // safe even if this goes to queue

    return () => {
      this._closed = true;
      if (this._port) {
        this._port.close();
      }
      this._port = null;
    };
  }

  get done() {
    return this._done;
  }

  push(arg) {
    if (typeof arg !== 'object') {
      console.warn('got unhandled message from client', arg);
      return;
    }

    if (this._nextResolve) {
      this._nextResolve(arg);
      this._nextResolve = null;
      this._nextPromise = null;
    } else {
      this._q.push(arg);
    }
  }

  next() {
    if (this._closed) {
      return null;
    } else if (this._q.length) {
      return this._q.shift();
    } else if (this._done) {
      return null;
    } else if (!this._nextPromise) {
      this._nextPromise = new Promise((resolve) => {
        this._nextResolve = resolve;
      });
    }
    return this._nextPromise;
  }
}


export const events = Object.freeze({
  'load': '-loader-load',
  'prepare': '-loader-prepare',
});


/**
 * Set the explicit w/h of the target iframe. Used to work around Safari issues.
 *
 * @param {!HTMLIFrameElement} iframe to rectify
 * @param {boolean} tilt whether the screen is rotated
 */
const rectifyFrame = (iframe, tilt) => {
  let targetWidth = window.innerWidth;
  let targetHeight = window.innerHeight;

  if (tilt) {
    let temp = targetWidth;
    targetWidth = targetHeight;
    targetHeight = temp;
  }

  delete iframe.style.width;
  delete iframe.style.height;
  iframe.offfsetLeft;

  if (iframe.offsetHeight !== targetHeight || iframe.offsetWidth !== targetWidth) {
    iframe.style.width = `${targetWidth}px`;
    iframe.style.height = `${targetHeight}px`;
  }
};



/**
 * Loads iframes.
 */
class SantaGameLoaderElement extends HTMLElement {
  static get observedAttributes() { return ['disabled', 'tilt']; }

  constructor() {
    super();
    this._resizeCheckLeft = 0;

    const root = this.attachShadow({mode: 'open'});
    root.adoptedStyleSheets = [styles];

    // Use this container to manage focus on contained iframes, rather than setting classes or
    // attributes on the loader itself.
    this._main = document.createElement('main');
    this._main.classList.add('empty');
    root.appendChild(this._main);

    // Wrap `<slot>` in a container that can be toggled in an error state. The naked slot contains
    // content which will be displayed if a game fails to load, such as `<santa-error>`.
    const slotContainer = document.createElement('div');
    slotContainer.classList.add('slot-container');
    const slot = document.createElement('slot');
    slotContainer.appendChild(slot);

    // Create `.iframe-container` for rotate/etc effects.
    this._container = document.createElement('div');
    this._container.className = 'iframe-container';

    this._main.appendChild(slotContainer);
    this._main.appendChild(this._container);

    this._onWindowResize = dedup(this._onWindowResize.bind(this));

    Loader.timeout = () => 20000;
    Loader.unhandledLoad = (frame, href) => {
      console.warn('FAILING OPEN for unhandled load', frame, href);
    };
    const el = this;  // reference for LoaderHandler subclass
    this._loader = new Loader(this._container, new (class extends LoaderHandler {
      unload(frame, href) {
        return el._unload(frame, href);
      }

      prepare(frame, href, context) {
        return el._prepare(frame, href, context);
      }

      ready(frame, href, payload) {
        return el._ready(frame, href, payload);
      }
    }));

    this._activeFrame = null;  // stores most recent active frame
    this._previousFrameClose = () => {};  // shutdown handler for frame
    this.purge = () => {};
    this._control = new PortControl();

    // Create DOM that contains overlay elements.
    // TODO(samthor): This isn't really to do with the gameloader, but serves as a convinent place
    // to place elements which are intended to look like they're part of the game (tutorial,
    // rotate, level up indicators).

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const holder = document.createElement('div');
    holder.classList.add('holder');

    const slotOverlay = document.createElement('slot');
    slotOverlay.setAttribute('name', 'overlay');

    root.appendChild(overlay);
    overlay.appendChild(holder);
    holder.appendChild(slotOverlay);
  }

  _onWindowResize() {
    if (!this._resizeCheckLeft) {
      this._resizeCheckLeft = 16;  // check for 16 frames
      this._checkWindowResize();
    }
  }

  _checkWindowResize() {
    if (this._resizeCheckLeft) {
      --this._resizeCheckLeft;
      window.requestAnimationFrame(() => this._checkWindowResize());
    }

    // Safari (and others) won't resize an iframe correctly. If we find that their size is invalid,
    // then force it via changing CSS properties.
    const tilt = this.hasAttribute('tilt');
    Array.from(this._container.children).forEach((frame) => rectifyFrame(frame, tilt));
  }

  connectedCallback() {
    window.addEventListener('resize', this._onWindowResize);
  }

  disconnectedCallback() {
    window.addEventListener('resize', this._onWindowResize);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    switch (attrName) {
      case 'disabled':
        this._loader.disabled = this.hasAttribute('disabled');
        break;

      case 'tilt':
        this._onWindowResize();
        break;
    }
  }

  /**
   * We override focus to actually focus on the activeFrame. This is used to (hopefully) push
   * keyboard events there.
   *
   * @override
   */
  focus() {
    super.focus();
    if (this._activeFrame) {
      this._activeFrame.focus();
    }
  }

  /**
   * Load a new scene.
   *
   * @param {?string} href
   * @param {?*} context to pass via .load event
   */
  load(href, context) {
    const close = this._control.shutdown();
    this._control = new PortControl();

    if (this._loader.isLoading) {
      close();  // close immediately, the loader never finished
    } else {
      this._previousFrameClose = close;
    }

    this.dispatchEvent(new CustomEvent(events.load));
    return this._loader.load(href, context);
  }

  _unload(frame, href) {
    this.purge();
    this._main.classList.add('loading');

    const r = resolvable();
    this.purge = r.resolve;
    return r.promise;
  }

  async _prepare(frame, href, context) {
    frame.classList.add('pending');
    this._activeFrame = frame;  // store most recent active frame

    const port = await prepareMessage(frame, 30 * 1000);
    if (frame !== this._activeFrame) {
      window.ga('send', 'event', 'nav', 'preempted', 'load');
      return null;  // check for preempt
    }

    const control = this._control;
    control.attach(port);

    return new Promise((resolve) => {
      // Announce to the caller that it can now prepare a new frame, listening to control events and
      // doing work. Control can also be null if the scene failed to load or is the blank page.
      const detail = {
        context,
        control,
        ready: () => {
          resolve(port ? control : null);  // resolve with null if there's no scene here
          if (frame !== this._activeFrame) {
            window.ga('send', 'event', 'nav', 'preempted', 'port');
            return false;  // no longer active
          }
          this.purge();
          return true;
        },
      };
      this.dispatchEvent(new CustomEvent(events.prepare, {detail}));
    });
  }

  _ready(frame, href, payload) {
    // Success: the frame has reported ready. The following code is entirely non-async, and just
    // cleans up state as the scene is now active and happy.
    this._previousFrameClose();

    // Try to focus the frame so default keyboard input goes here.
    frame.focus();

    // Clean up CSS classes set during load.
    frame.classList.remove('pending');
    this._main.classList.remove('loading');

    // If nothing loaded, allow <slot> content and remove itself. This is still "success".
    this._main.classList.toggle('empty', !payload);

  }

  get href() {
    return this._loader.href;
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(v) {
    if (v) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
}


customElements.define('santa-gameloader', SantaGameLoaderElement);