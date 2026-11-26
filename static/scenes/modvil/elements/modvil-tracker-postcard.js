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
 * Computes CSS custom properties so longer notes or expanded translations fit naturally on the
 * unlined left half of the postcard without clipping the next-stop line or signature.
 * @param {!Object} p resolved postcard
 * @return {string}
 */
function noteSizingStyle(p) {
  const nextLine = p.nextCity ? POSTCARD_UI_STRINGS.nextStop(p.nextCity) : '';
  const total = (p.message || '').length + nextLine.length;
  const t = Math.max(0, Math.min(1, (total - 150) / 115));
  const size = (3.55 - t * 0.9).toFixed(2);
  const lh = (1.5 - t * 0.14).toFixed(2);
  const gap = (1.05 - t * 0.3).toFixed(2);
  return `--note-size: ${size}cqw; --note-lh: ${lh}; --note-gap: ${gap}em;`;
}

/**
 * Rubber-stamp postmark: the designer's ring + wavy-lines artwork (no text). All text (city on the
 * top arc, "Made with Gemini" on the bottom arc, date in the middle) is live text so it
 * localizes; nothing is baked into an image.
 *
 * Note: keep every SVG child element directly inside the `<svg>` literal (never inside a nested
 * `html\`<textPath>...\`` sub-template, which lit-html parses in the HTML namespace instead of SVG).
 * @param {!Object} p resolved postcard
 */
function renderPostmark(p) {
  const {month, day} = postmarkDate(p.postmarkDay || 24);
  const len = Math.max(1, p.city.length);
  // Match the bottom "Made with Gemini" band height (~58-60px) for normal cities, and scale gently
  // across a 210° upper arc for very long names (e.g. Petropavlovsk-Kamchatsky).
  const cityFontSize =
    len <= 13 ? 58 : Math.max(36, Math.min(56, Math.floor(560 / (len * 0.61))));
  const cityTracking = len <= 10 ? '0.1em' : len <= 15 ? '0.05em' : '0.02em';
  const topR = Math.round(204.5 - cityFontSize * 0.36);
  const dx = (topR * Math.cos((15 * Math.PI) / 180)).toFixed(1);
  const dy = (topR * Math.sin((15 * Math.PI) / 180)).toFixed(1);
  const topPath = `M${(683.5 - Number(dx)).toFixed(1)} ${(282.5 + Number(dy)).toFixed(1)} A${topR} ${topR} 0 1 1 ${(683.5 + Number(dx)).toFixed(1)} ${(282.5 + Number(dy)).toFixed(1)}`;

  const brandText = POSTCARD_UI_STRINGS.madeWithGemini();
  const brandLen = Math.max(1, brandText.length);
  const brandFontSize =
    brandLen <= 16 ? 60 : Math.max(36, Math.floor((60 * 16) / brandLen));
  const botR = Math.round(205.5 + brandFontSize * 0.36);
  const botPath = `M${683.5 - botR} 282.5 a${botR} ${botR} 0 0 0 ${botR * 2} 0`;
  return html`
    <svg class="postmark" viewBox="0 0 965 562" aria-hidden="true">
      <defs>
        <!-- Ring centre (683.5, 282.5) and band radii (161..247) measured from postcard_postmark.png. -->
        <path id="pm-top" d=${topPath} />
        <path id="pm-bottom" d=${botPath} />
      </defs>
      <image href=${POSTCARD_SHARED_ASSETS.postmarkUrl} width="965" height="562" />
      <text class="pm-arc" style="font-size: ${cityFontSize}px; letter-spacing: ${cityTracking}">
        <textPath href="#pm-top" startOffset="50%" text-anchor="middle">${p.city}</textPath>
      </text>
      <text class="pm-arc pm-brand" style="font-size: ${brandFontSize}px">
        <textPath href="#pm-bottom" startOffset="50%" text-anchor="middle">${brandText}</textPath>
      </text>
      <text class="pm-date pm-month" x="683.5" y="270" text-anchor="middle">${month}</text>
      <text class="pm-date pm-day" x="683.5" y="334" text-anchor="middle">${day}</text>
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
    // The host builds a fresh postcard object on every render, so only reset to the front
    // when it's actually a different postcard (otherwise any host re-render un-flips it).
    if (changedProps.has('postcard')) {
      const prev = changedProps.get('postcard');
      const prevId = prev ? prev.id : null;
      const nextId = this.postcard ? this.postcard.id : null;
      if (prevId !== nextId) {
        this.flipped = false;
      }
    }
    if (changedProps.has('flipped')) {
      // Lets the host (e.g. the mailbox's flip button) keep its label in sync with the card.
      this.dispatchEvent(new CustomEvent('flipped-changed', {detail: {flipped: this.flipped}}));
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

          <div
            class="postcard-face postcard-back"
            style=${noteSizingStyle(p)}
            ?inert=${!this.flipped}
          >
            <div class="inset-frame" aria-hidden="true"></div>
            <div class="back-left">
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
                <div class="address-line"><span>${POSTCARD_UI_STRINGS.recipientName()}</span></div>
                <div class="address-line"><span>${POSTCARD_UI_STRINGS.recipientStreet()}</span></div>
                <div class="address-line"><span>${POSTCARD_UI_STRINGS.recipientCity()}</span></div>
                <div class="address-line" aria-hidden="true"></div>
              </div>
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
