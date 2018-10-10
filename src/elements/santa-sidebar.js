import {LitElement, html} from '@polymer/lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';

import {_msg, runtimeTranslate, getLanguage, localizeUrl} from '../lib/runtime.js';

export class SantaSidebarElement extends LitElement {
  static get properties() {
    return {
      todayHouse: {type: String},
      trackerIsOpen: {type: Boolean},
    };
  }

  _onLanguageChange(ev) {
    // TODO(samthor): Change site language.
    console.info('got language change', ev.target.value);
  }

  render() {
    const todayHouse = (this.todayHouse ? html`
<a href="./${this.todayHouse}.html">
  <div class="menucard" style="background-image: url(img/scenes/${this.todayHouse}_2x.png)">
    <h2>${_msg`newtoday`}</h2>
    <h3>${runtimeTranslate(`scene/${this.todayHouse}`)}</h3>
  </div>
</a>
    ` : '');

    return html`
<style>
/* TODO: from generated code */
:host {
  display: block;
  background: white;
  overflow-y: auto;
}
.cards{border-bottom:4px solid #eee}.links{padding:12px 12px 4px 24px}.links h2{color:#7bc7e5}.links a{color:#64ae69}.links a:hover{text-decoration:underline}.lang{padding-left:20px;line-height:32px;padding-bottom:8px}.lang select{vertical-align:middle}a{color:inherit;text-decoration:none}.menucard{box-sizing:border-box;height:150px;background:transparent center right no-repeat;background-size:cover;padding:12px 12px 12px 24px;color:#fff;display:-webkit-box;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;flex-direction:column;-webkit-box-pack:center;justify-content:center;position:relative}.menucard .lock{position:absolute;top:0;left:0;right:0;bottom:0;background:url(img/lock.svg) 90% 50% no-repeat;background-color:rgba(87,214,147,.5);background-size:42px 42px}.menucard-village{background-image:url(img/menu-village.png)}.menucard-tracker{background-image:url(img/menu-tracker.png)}h2{font-size:1em;letter-spacing:1px;font-weight:600;margin:6px 0;line-height:1em;text-transform:uppercase}h3{margin:0;font-size:2.875em;line-height:1.25em;text-shadow:0 2px 0 rgba(0,0,0,.25);font-family:"Lobster"}ul{list-style:none;margin:0;padding:0;padding-top:6px;line-height:1.2em;font-size:1.2em;font-weight:500}ul li{margin:0;padding:.4em 0}ul li a{display:block}
</style>

<slot></slot>

<div class="cards">
  <a href="./village.html">
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
  <select id="language" .value=${getLanguage()} @change=${this._onLanguageChange}>
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
  <h2>${_msg`village_more`}</h2>
  <ul>
    <!-- TODO(samthor): re-add A2HS code -->
    <li>
      <a target="_blank" rel="noopener" href=${localizeUrl('https://play.google.com/store/apps/details?id=com.google.android.apps.santatracker')}>${_msg`village_get_the_app`}</a>
    </li>
    <li>
      <a target="_blank" rel="noopener" href=${localizeUrl('https://chrome.google.com/webstore/detail/santa-tracker/iodomglenhcehfbhbakhedmbobhbgjcb')}>${_msg`village_santa_crx`}</a>
    </li>
    <li>
      <a target="_blank" rel="noopener" href=${localizeUrl('https://policies.google.com/')}>${_msg`terms-and-privacy`}</a>
    </li>
    <li>
      <a target="_blank" rel="noopener" href=${localizeUrl('https://maps.google.com/maps/about/')}>${_msg`getgooglemaps`}</a>
    </li>
  </ul>
</div>
    `;
  }
}


customElements.define('santa-sidebar', SantaSidebarElement);
