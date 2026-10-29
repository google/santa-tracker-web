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
import styles from './modvil-tracker-postcard.css';
import {POSTCARD_SHARED_ASSETS, POSTCARD_UI_STRINGS} from './postcards-data.js';

/**
 * Month of Santa's flight, formatted for the page language (e.g. "DEC", "DIC.", "12月").
 * The postmark date is the only date on the card, so it's derived here, not translated.
 * @param {number} day
 * @return {{month: string, day: string}}
 */
function postmarkDate(day) {
  const lang = document.documentElement.lang || undefined;
  const date = new Date(Date.UTC(new Date().getUTCFullYear(), 11, day));
  const opts = {timeZone: 'UTC'};
  return {
    month: new Intl.DateTimeFormat(lang, {...opts, month: 'short'}).format(date),
    day: new Intl.DateTimeFormat(lang, {...opts, day: 'numeric'}).format(date),
  };
}

/**
 * Rubber-stamp postmark: the designer's ring + wavy-lines artwork (no text). All text (city on the
 * top arc, "Made with Gemini" on the bottom arc, date in the middle) is live text so it
 * localizes; nothing is baked into an image.
 * @param {!Object} p resolved postcard
 */
function renderPostmark(p) {
  const {month, day} = postmarkDate(p.postmarkDay || 24);
  // Long city names (e.g. Petropavlovsk-Kamchatsky) would run off the top arc: shrink the
  // font so the name fits in ~70% of the arc (about 400 SVG units).
  const cityFontSize = Math.min(50, Math.floor(400 / (Math.max(1, p.city.length) * 0.75)));
  return html`
    <svg class="postmark" viewBox="0 0 965 562" aria-hidden="true">
      <defs>
        <!-- Ring centre (683, 281) and radii are measured from postcard_postmark.png. -->
        <path id="pm-top" d="M499 281 a184 184 0 0 1 368 0" />
        <path id="pm-bottom" d="M455 281 a228 228 0 0 0 456 0" />
      </defs>
      <image href=${POSTCARD_SHARED_ASSETS.postmarkUrl} width="965" height="562" />
      <text class="pm-arc" style="font-size: ${cityFontSize}px">
        <textPath href="#pm-top" startOffset="50%" text-anchor="middle">${p.city}</textPath>
      </text>
      <text class="pm-arc pm-brand">
        <textPath href="#pm-bottom" startOffset="50%" text-anchor="middle">${POSTCARD_UI_STRINGS.madeWithGemini()}</textPath>
      </text>
      <text class="pm-date" x="683" y="268" text-anchor="middle">${month}</text>
      <text class="pm-date" x="683" y="345" text-anchor="middle">${day}</text>
    </svg>
  `;
}

export class ModvilTrackerPostcard extends LitElement {
  static get styles() {
    return [styles];
  }

  static get properties() {
    return {
      postcard: {type: Object},
      flipped: {type: Boolean, reflect: true},
      interactive: {type: Boolean},
      // Flip/download/share buttons under the card. Off for now: the card flips on click.
      showActions: {type: Boolean, attribute: 'show-actions'},
    };
  }

  constructor() {
    super();
    this.postcard = null;
    this.flipped = false;
    this.interactive = true;
    this.showActions = false;
  }

  updated(changedProps) {
    if (changedProps.has('postcard')) {
      this.flipped = false;
    }
  }

  _toggleFlip(ev) {
    if (!this.interactive) {
      return;
    }
    if (ev) {
      ev.stopPropagation();
    }
    this.flipped = !this.flipped;
  }

  _onKeyDown(ev) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this._toggleFlip(ev);
    }
  }

  async _onDownload(ev) {
    ev.stopPropagation();
    if (!this.postcard || !this.postcard.frontUrl) {
      return;
    }
    const link = document.createElement('a');
    link.href = this.postcard.frontUrl;
    link.download = `santa-postcard-${this.postcard.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async _onShare(ev) {
    ev.stopPropagation();
    if (!this.postcard || !navigator.share) {
      return this._onDownload(ev);
    }
    try {
      await navigator.share({
        title: `${this.postcard.city} — Santa Tracker`,
        text: this.postcard.message,
        url: window.location.href,
      });
    } catch (err) {
      // User cancelled share sheet
    }
  }

  render() {
    const p = this.postcard;
    if (!p) {
      return html``;
    }

    const flipLabel = this.flipped
      ? POSTCARD_UI_STRINGS.flipToFront()
      : POSTCARD_UI_STRINGS.flipToBack();

    return html`
      <div class="postcard-wrapper">
        <div
          class="postcard-scene ${this.flipped ? 'is-flipped' : ''}"
          role="button"
          tabindex="0"
          aria-label=${flipLabel}
          @click=${this._toggleFlip}
          @keydown=${this._onKeyDown}
        >
          <div class="postcard-face postcard-front" ?inert=${this.flipped}>
            <img
              class="front-illustration"
              src=${p.frontUrl}
              alt="${p.city}, ${p.region}"
              loading="lazy"
            />
            <div class="front-overlay">
              <div class="location-label">
                <span class="city">${p.city}</span>
                <span class="region">${p.region}</span>
              </div>
            </div>
          </div>

          <div class="postcard-face postcard-back" ?inert=${!this.flipped}>
            <div class="back-left">
              <h3 class="journal-title">${POSTCARD_UI_STRINGS.journalTitle()}</h3>
              <p class="dispatch-message">${p.message}</p>
              ${p.nextCity
                ? html`<p class="dispatch-next">${POSTCARD_UI_STRINGS.nextStop(p.nextCity)}</p>`
                : ''}
              <p class="dispatch-signature">${POSTCARD_UI_STRINGS.santaSignature()}</p>
            </div>

            <div class="back-divider" aria-hidden="true"></div>

            <div class="back-right">
              <div class="stamp" aria-hidden="true">
                <img class="stamp-frame" src=${POSTCARD_SHARED_ASSETS.stampUrl} alt="" />
                <img class="stamp-spark" src=${POSTCARD_SHARED_ASSETS.geminiSparkUrl} alt="" />
              </div>
              ${renderPostmark(p)}
              <div class="address">
                <div class="address-line">${POSTCARD_UI_STRINGS.recipientName()}</div>
                <div class="address-line">${POSTCARD_UI_STRINGS.recipientStreet()}</div>
                <div class="address-line">${POSTCARD_UI_STRINGS.recipientCity()}</div>
                <div class="address-line"></div>
              </div>
              <div class="back-footer">${[p.city, p.region].filter(Boolean).join(', ')}</div>
            </div>
          </div>
        </div>

        ${this.interactive && this.showActions
          ? html`
              <div class="postcard-actions">
                <button class="action-btn" @click=${this._toggleFlip}>
                  🔄 ${flipLabel}
                </button>
                <button class="action-btn" @click=${this._onDownload}>
                  ⬇️ ${POSTCARD_UI_STRINGS.download()}
                </button>
                ${typeof navigator.share === 'function'
                  ? html`
                      <button class="action-btn" @click=${this._onShare}>
                        📤 ${POSTCARD_UI_STRINGS.share()}
                      </button>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }
}

customElements.define('modvil-tracker-postcard', ModvilTrackerPostcard);
