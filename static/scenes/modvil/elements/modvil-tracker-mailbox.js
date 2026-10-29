/**
 * Copyright 2026 Google LLC
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

import {html, LitElement} from 'lit-element';
import styles from './modvil-tracker-mailbox.css';
import {getPostcardForDestination, POSTCARD_SHARED_ASSETS, POSTCARD_UI_STRINGS} from './postcards-data.js';
import './modvil-tracker-postcard.js';

// Chevron pointing right; CSS flips it for "previous" / "back".
const arrowSvg = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 5.4 10 4l8 8-8 8-1.4-1.4L15.2 12z"/></svg>`;
const closeSvg = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>`;

export class ModvilTrackerMailbox extends LitElement {
  static get styles() {
    return [styles];
  }

  static get properties() {
    return {
      destinations: {type: Array},
      stops: {type: Array},
      open: {type: Boolean, reflect: true},
      _selectedIndex: {type: Number},
      _flyInPostcard: {type: Object},
      _unreadCount: {type: Number},
      _view: {type: String},
    };
  }

  constructor() {
    super();
    this.destinations = [];
    this.stops = [];
    this.open = false;
    this._selectedIndex = 0;
    this._flyInPostcard = null;
    this._unreadCount = 0;
    this._lastSeenStopId = null;
    this._view = 'carousel';  // 'carousel' | 'gallery'
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  get collectedPostcards() {
    if (!this.destinations || !this.stops || !this.stops.length) {
      return [];
    }
    const visitedSet = new Set(this.stops);
    const collected = [];
    this.destinations.forEach((dest, i) => {
      if (visitedSet.has(dest.id)) {
        const card = getPostcardForDestination(dest, this.destinations[i + 1]);
        if (card) {
          collected.push(card);
        }
      }
    });
    return collected.reverse();
  }

  updated(changedProps) {
    if (changedProps.has('stops') && this.stops && this.stops.length) {
      const latestStopId = this.stops[this.stops.length - 1];
      if (this._lastSeenStopId && latestStopId !== this._lastSeenStopId) {
        const destObj = (this.destinations || []).find((d) => d.id === latestStopId);
        const newCard = getPostcardForDestination(destObj);
        if (newCard) {
          this._triggerFlyIn(newCard);
        }
      }
      this._lastSeenStopId = latestStopId;
    }
  }

  async _triggerFlyIn(postcard) {
    this._flyInPostcard = postcard;
    if (!this.open) {
      this._unreadCount += 1;
    }
    if (this._flyInAnimation) {
      this._flyInAnimation.cancel();
    }
    await this.updateComplete;

    const preview = this.renderRoot.querySelector('.fly-in-preview');
    const button = this.renderRoot.querySelector('.mailbox-button');
    if (!preview || !button) {
      this._flyInPostcard = null;
      return;
    }

    // Fly from the viewport center to wherever the mailbox button actually is.
    const target = button.getBoundingClientRect();
    // Aim at the open mailbox slot (left part of the illustration).
    const dx = target.left + target.width * 0.3 - window.innerWidth / 2;
    const dy = target.top + target.height * 0.6 - window.innerHeight / 2;
    const center = 'translate(-50%, -50%)';
    this._flyInAnimation = preview.animate(
      [
        {transform: `${center} scale(0.3) rotate(-8deg)`, opacity: 0},
        {transform: `${center} scale(1.05) rotate(2deg)`, opacity: 1, offset: 0.18},
        {transform: `${center} scale(1) rotate(0deg)`, opacity: 1, offset: 0.72},
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.1) rotate(12deg)`,
          opacity: 0,
        },
      ],
      {duration: 2100, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards'}
    );
    this._flyInAnimation.onfinish = () => {
      this._flyInPostcard = null;
      this._flyInAnimation = null;
    };
  }

  _toggleOpen() {
    this.open = !this.open;
    if (this.open) {
      this._unreadCount = 0;
      this._selectedIndex = 0;
      this._view = 'carousel';
      window.addEventListener('keydown', this._onKeyDown);
    } else {
      window.removeEventListener('keydown', this._onKeyDown);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._onKeyDown);
  }

  _onKeyDown(ev) {
    if (ev.key === 'Escape') {
      this._toggleOpen();
    } else if (this._view === 'carousel' && ev.key === 'ArrowLeft') {
      this._step(-1);
    } else if (this._view === 'carousel' && ev.key === 'ArrowRight') {
      this._step(+1);
    }
  }

  /**
   * Moves the carousel by `delta` cards, wrapping around at both ends.
   * @param {number} delta
   */
  _step(delta) {
    const count = this.collectedPostcards.length;
    if (count < 2) {
      return;
    }
    this._selectedIndex = (this._selectedIndex + delta + count) % count;
  }

  _onScrimClick(ev) {
    // Clicking the dimmed map (not the card or controls) closes the mailbox.
    if (ev.target === ev.currentTarget) {
      this._toggleOpen();
    }
  }

  _openGallery() {
    this._view = 'gallery';
  }

  _openFromGallery(idx) {
    this._selectedIndex = idx;
    this._view = 'carousel';
  }

  _renderCarousel(cards) {
    const index = Math.min(this._selectedIndex, cards.length - 1);
    const activeCard = cards[index];
    const multiple = cards.length > 1;
    return html`
      <div class="carousel">
        <button
          class="nav-btn prev"
          ?hidden=${!multiple}
          aria-label=${POSTCARD_UI_STRINGS.previous()}
          @click=${() => this._step(-1)}
        >${arrowSvg}</button>
        <div class="slot-frame">
          <modvil-tracker-postcard .postcard=${activeCard}></modvil-tracker-postcard>
        </div>
        <button
          class="nav-btn next"
          ?hidden=${!multiple}
          aria-label=${POSTCARD_UI_STRINGS.next()}
          @click=${() => this._step(+1)}
        >${arrowSvg}</button>
      </div>
      <div class="carousel-footer">
        <span class="counter" ?hidden=${!multiple}>${index + 1} / ${cards.length}</span>
        <button class="pill-btn" @click=${this._openGallery}>
          ${POSTCARD_UI_STRINGS.viewAll()}
        </button>
      </div>
    `;
  }

  _renderGallery(cards) {
    return html`
      <div class="gallery-panel">
        <div class="gallery-header">
          <button class="icon-btn back-btn" aria-label=${POSTCARD_UI_STRINGS.back()} @click=${() => (this._view = 'carousel')}>${arrowSvg}</button>
          <h2>${POSTCARD_UI_STRINGS.mailboxLabel()}</h2>
          <span class="count">${cards.length}</span>
        </div>
        <div class="gallery-grid" role="list">
          ${cards.map(
            (card, idx) => html`
              <button class="grid-card" role="listitem" @click=${() => this._openFromGallery(idx)}>
                <img src=${card.frontUrl} alt="" loading="lazy" />
                <span>${card.city}</span>
              </button>
            `
          )}
        </div>
      </div>
    `;
  }

  render() {
    const cards = this.collectedPostcards;
    let body;
    if (!cards.length) {
      body = html`<p class="empty-msg">${POSTCARD_UI_STRINGS.emptyMailbox()}</p>`;
    } else if (this._view === 'gallery') {
      body = this._renderGallery(cards);
    } else {
      body = this._renderCarousel(cards);
    }

    return html`
      <button
        class="mailbox-button ${this._flyInPostcard ? 'receiving' : ''}"
        aria-label=${POSTCARD_UI_STRINGS.mailboxLabel()}
        @click=${this._toggleOpen}
      >
        <img class="mailbox-icon" src=${POSTCARD_SHARED_ASSETS.mailboxUrl} alt="" width="104" height="95" />
        ${this._unreadCount > 0
          ? html`<span class="unread-dot">${this._unreadCount}</span>`
          : ''}
      </button>

      ${this._flyInPostcard
        ? html`
            <div class="fly-in-preview" @click=${this._toggleOpen}>
              <img src=${this._flyInPostcard.frontUrl} alt="" />
              <span>${this._flyInPostcard.city}</span>
            </div>
          `
        : ''}

      ${this.open
        ? html`
            <div
              class="scrim"
              role="dialog"
              aria-modal="true"
              aria-label=${POSTCARD_UI_STRINGS.mailboxLabel()}
              @click=${this._onScrimClick}
            >
              <button class="icon-btn close-btn" aria-label=${POSTCARD_UI_STRINGS.close()} @click=${this._toggleOpen}>${closeSvg}</button>
              ${body}
            </div>
          `
        : ''}
    `;
  }
}

customElements.define('modvil-tracker-mailbox', ModvilTrackerMailbox);
