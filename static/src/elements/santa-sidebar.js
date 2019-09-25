import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';

import scenes from '../strings/scenes.js';
import {_msg, _static} from '../magic.js';

import styles from './santa-sidebar.css';

export class SantaSidebarElement extends LitElement {
  static get properties() {
    return {
      todayHouse: {type: String},
      trackerIsOpen: {type: Boolean},
    };
  }

  static get styles() {
    return [styles];
  }

  _onLanguageChange(ev) {
    window.location = `/intl/${ev.target.value}/`;
  }

  render() {
    const todayHouse =
        (this.todayHouse ? html`
<a href="./${this.todayHouse}.html"}>
  <div class="menucard" style="background-image: url(${_static`img/scenes/`}${this.todayHouse}_2x.png)">
    <h2>${_msg`newtoday`}</h2>
    <h3>${scenes[this.todayHouse] || ''}</h3>
  </div>
</a>
    ` : '');

    return html`
<slot></slot>

<main>
  <div class="cards">
    <a href="./">
      <div class="menucard menucard-village">
        <h2>${_msg`calendar`}</h2>
        <h3>${_msg`santasvillage`}</h3>
      </div>
    </a>
    ${todayHouse}
    <a href=${ifDefined(this.trackerIsOpen ? './tracker.html' : undefined)}>
      <div class="menucard menucard-tracker">
        <div class="lock" ?hidden=${this.trackerIsOpen}></div>
        <h2>${_msg`dec24th`}</h2>
        <h3>${_msg`tracker_track`}</h3>
      </div>
    </a>
  </div>

  <div class="links">
    <ul>
      <li><a href="./press.html">${_msg`press`}</a></li>
      <li><a href="./educators.html">${_msg`educators`}</a></li>
    </ul>
  </div>

  <div class="lang">
    <svg class="globe">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"></path>
    </svg>
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
      <option value="hi">Hindi</option>
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
      <option value="fi">Viimeistely</option>
      <option value="bg">Български</option>
      <option value="uk">Український</option>
      <option value="ta">தமிழ்</option>
      <option value="ml">മലയാളം </option>
      <option value="th">ภาษาไทย</option>
    </select>
  </div>

  <div class="links">
    <ul>
      <li>
        <a target="_blank" rel="noopener" href="https://policies.google.com/">${unsafeHTML(_msg`terms-and-privacy`)}</a>
      </li>
    </ul>
  </div>
</main>
    `;
  }
}


customElements.define('santa-sidebar', SantaSidebarElement);
