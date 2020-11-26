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

import styles from './santa-choice.css';

const hasResizeObserver = Boolean(self.ResizeObserver);

export class SantaChoiceElement extends HTMLElement {
  constructor() {
    super();

    this._requestedCheck = false;

    const template = document.createElement('template');
    template.innerHTML = `
<div class="wrap">
  <button class="left"></button>
  <div class="scroller">
    <slot></slot>
  </div>
  <button class="right"></button>
</div>
`;
    if (self.ShadyCSS) {
      self.ShadyCSS.prepareTemplate(template, 'santa-choice');
    }

    this.attachShadow({mode: 'open'});

    // TODO(samthor): Does this work without inheriting from LitElement?
    this.shadowRoot.adoptedStyleSheets = [styles];

    this.shadowRoot.appendChild(document.importNode(template.content, true));
    this._wrapEl = this.shadowRoot.querySelector('.wrap');
    this._scrollerEl = this._wrapEl.querySelector('.scroller');

    // handle up/down scrollwheel on the scroller, as most folks don't have horizontal scroll
    this._scrollerEl.addEventListener('wheel', (ev) => {
      this._scrollerEl.scrollLeft += ev.deltaY;
    }, {passive: true});

    // actually observe scroll/mutation
    this._requestCheck = this._requestCheck.bind(this);
    this._scrollerEl.addEventListener('scroll', this._requestCheck, {passive: true});
    const mo = new MutationObserver(this._requestCheck);
    mo.observe(this, {childList: true, subtree: true});

    // additionally use ResizeObserver if available
    if (hasResizeObserver) {
      const ro = new self.ResizeObserver(this._requestCheck);
      ro.observe(this);
    }

    // drag support with omouse only

    let mouseDragStart = undefined;
    let prevMouseDrag = undefined;
    const moveHandler = (ev) => {
      if (!ev.buttons || !ev.which) {
        return cleanupMoveHandler();
      }
      this._scrollerEl.scrollLeft += (prevMouseDrag - ev.screenX);
      prevMouseDrag = ev.screenX;
    };

    let preventNextClick = 0;
    const cleanupMoveHandler = () => {
      this._scrollerEl.removeEventListener('mousemove', moveHandler);
      const delta = Math.abs(mouseDragStart - prevMouseDrag);
      if (delta > 16) {
        preventNextClick = window.setTimeout(() => {
          preventNextClick = 0;
        }, 0);
      }
    };

    this._scrollerEl.addEventListener('mouseup', cleanupMoveHandler);

    this._scrollerEl.addEventListener('mousedown', (ev) => {
      prevMouseDrag = ev.screenX;
      mouseDragStart = ev.screenX;
      this._scrollerEl.addEventListener('mousemove', moveHandler);
    });
    this._scrollerEl.addEventListener('click', (ev) => {
      preventNextClick && ev.preventDefault();
      this._scrollerEl.removeEventListener('mousemove', moveHandler);
    });

    // animate on rAF while buttons held

    let prev = 0;
    let active = null;

    const update = (now) => {
      if (active === null) {
        return;
      }
      window.requestAnimationFrame(update);
      const delta = prev - now;
      prev = now;

      if (active) {
        this._scrollerEl.scrollLeft -= delta/2;
      } else {
        this._scrollerEl.scrollLeft += delta/2;
      }
    };

    const setup = (ev) => {
      cancel();
      if (ev.target.classList.contains('left')) {
        active = false;
      } else if (ev.target.classList.contains('right')) {
        active = true;
      } else {
        return;
      }
      ev.preventDefault();

      prev = performance.now();
      window.requestAnimationFrame(update);
    };

    this._wrapEl.addEventListener('touchstart', setup);
    this._wrapEl.addEventListener('mousedown', setup);

    const cancel = () => {
      active = null;
    };

    ['mouseup', 'mouseout', 'touchend', 'touchcancel'].forEach((eventName) => {
      this._wrapEl.addEventListener(eventName, cancel);
    });
  }

  connectedCallback() {
    if (!hasResizeObserver) {
      window.addEventListener('resize', this._requestCheck);
    }
  }

  disconnectedCallback() {
    if (!hasResizeObserver) {
      window.removeEventListener('resize', this._requestCheck);
    }
  }

  _requestCheck() {
    if (this._requestedCheck) {
      return;
    }
    this._requestedCheck = true;
    window.requestAnimationFrame(() => {
      this._requestedCheck = false;
      this._check();
    });
  }

  /**
   * Actually check and update the visibility of the left/right control buttons.
   */
  _check() {
    const el = this._scrollerEl;
    const cl = this._wrapEl.classList;

    if (el.scrollWidth <= this._wrapEl.offsetWidth + 42) {
      cl.remove('left', 'right');
    } else {
      cl.toggle('left', Boolean(el.scrollLeft));
      cl.toggle('right', Boolean(el.scrollLeft < el.scrollWidth - this._wrapEl.offsetWidth));
    }
  }
}


customElements.define('santa-choice', SantaChoiceElement);
