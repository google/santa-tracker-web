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

import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import * as config from '../core/config.js';
import styles from './santa-cardnav.css';
import {_msg, _static} from '../magic.js';
import './santa-card.js';
import './santa-install.js';
import isAndroid from '../core/android.js';


export class SantaCardNavElement extends LitElement {
  static get properties() {
    return {
      cards: {type: Array},
      _cols: {type: Number},
      _configNonce: {type: Object},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    const update = () => {
      this.cards = config.nav().filter((x) => {
        if (x[0] === '@' && !isAndroid()) {
          return false;
        }
        return true;
      });
    };
    config.listen(update);
    update();

    this._onWindowResize = this._onWindowResize.bind(this);
    this._onConfigUpdate = this._onConfigUpdate.bind(this);
  }

  _onWindowResize() {
    const width = this.offsetWidth || window.innerWidth;
    const itemSize = ((width < 768) ? 130 : 200) + 20;  // css width + padding
    this._cols = Math.max(2, Math.min(6, Math.floor(width / itemSize)));  // put between 2-6 inclusive
  }

  _onConfigUpdate(nonce) {
    this._configNonce = nonce;
  }

  connectedCallback() {
    super.connectedCallback();

    config.listen(this._onConfigUpdate);
    window.addEventListener('resize', this._onWindowResize);
    this._onWindowResize();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    config.remove(this._onConfigUpdate);
    window.removeEventListener('resize', this._onWindowResize);
  }

  render() {
    let currentOrder = 0;
    const available = [];
    const videos = config.videos();

    const cardHtml = this.cards.map((sceneName, i) => {
      const locked = config.lockedTo(sceneName);

      const isVideo = videos.indexOf(sceneName) !== -1;

      let order = currentOrder;
      if (isVideo) {
        currentOrder += 2;

        // Make sure that (order + 1) isn't in the next row.
        const col = (order % this._cols);
        if (col + 1 === this._cols) {
          available.push(order);
          ++order;
          ++currentOrder;
        }

      } else {
        // Otherwise, use a previous space we skipped, or the next.
        if (available.length) {
          order = available.shift();
        } else {
          ++currentOrder;
        }
      }

      const style = `transition-delay: ${0.2 + order * 0.05}s; order: ${order}`;
      return html`<santa-card style=${style} locked=${ifDefined(locked)} scene=${sceneName} .video=${isVideo} ?wide=${isVideo}></santa-card>`;
    });

    const placeholders = [];
    for (let i = 0; i < 10; ++i) {
      placeholders.push(html`<div class="placeholder"></div>`);
    }

    return html`
<div id="wrap">
<div id="scroll">
<header>
  <santa-install></santa-install>
</header>
<main>${cardHtml}${placeholders}</main>
<footer>
<div class="inner">

<div class="grow">

<div class="lang">
  <select id="language" .value=${document.documentElement.lang} @change=${this._onLanguageChange}>
    <option value="af">Afrikaans</option>
    <option value="ca">Català</option>
    <option value="zh-CN">中文 (简体)</option>
    <option value="zh-HK">中文 (香港)</option>
    <option value="zh-TW">中文 (繁體)</option>
    <option value="da">Dansk</option>
    <option value="de">Deutsch</option>
    <option value="et">Eesti</option>
    <option value="en">English</option>
    <option value="en-GB">English (United Kingdom)</option>
    <option value="es">Español</option>
    <option value="es-419">Español (América Latina)</option>
    <option value="fr">Français</option>
    <option value="fr-CA">Français (Canada)</option>
    <option value="hi">हिन्दी</option>
    <option value="hr">Hrvatski</option>
    <option value="id">Indonesia</option>
    <option value="it">Italiano</option>
    <option value="ko">한국어</option>
    <option value="ja">日本語</option>
    <option value="lv">Latvijas</option>
    <option value="lt">Lietuvos</option>
    <option value="no">Norsk</option>
    <option value="pl">Polski</option>
    <option value="pt-BR">Português (Brasil)</option>
    <option value="pt-PT">Português (Portugal)</option>
    <option value="ru">Русский</ru>
    <option value="ro">Română</option>
    <option value="sl">Slovenija</option>
    <option value="sv">Svenska</option>
    <option value="tl">Tagalog</option>
    <option value="vi">Tiếng Việt</option>
    <option value="fi">Suomi</option>
    <option value="bg">Български</option>
    <option value="uk">Український</option>
    <option value="ta">தமிழ்</option>
    <option value="ml">മലയാളം </option>
    <option value="th">ภาษาไทย</option>
  </select>
  <h3>${_msg`language`}: <span></span></h3>
</div>

<div class="links">
<ul>
  <li>
    <a href="familyguide.html">${_msg`scene_family`}</a>
  </li>
  <li>
    <a target="_blank" rel="noopener" href="https://policies.google.com/">${unsafeHTML(_msg`terms-and-privacy`)}</a>
  </li>
  <li>
    <a href="notices.html">Third-Party Notices</a>
  </li>
</ul>
</div>

</div>

<img src="${_static`img/santa-menu.png`}" width="91" height="119" />

</div>
</footer>
</div>
</div>
    `;
  }

  firstUpdated() {
    const languageDisplay = this.renderRoot.querySelector('.lang span');
    const select = this.renderRoot.querySelector('select');
    const option = select.options[select.selectedIndex];
    languageDisplay.textContent = option ? option.textContent : 'Unknown';
  }

  _onLanguageChange(ev) {
    window.location = `/intl/${ev.target.value}/`;
  }
}

customElements.define('santa-cardnav', SantaCardNavElement);
