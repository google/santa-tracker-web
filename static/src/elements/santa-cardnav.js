import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import * as config from '../core/config.js';
import styles from './santa-cardnav.css';
import {_static, _msg} from '../magic.js';
import './santa-card.js';


// TODO(samthor): pull from Remote Config
const cards = 'selfies codeboogie jetpack jamband snowball elfmaker codelab wrapbattle penguindash museum boatload takeoff gumball presentbounce reindeerworries glider speedsketch santascanvas seasonofgiving penguinproof traditions wheressanta santasearch translations runner snowbox snowflake mercator build'.split(/\s+/g);


export class SantaCardNavElement extends LitElement {
  static get properties() {
    return {
      _cols: {type: Number},
      _configNonce: {type: Object},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();

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

    const cardHtml = cards.map((sceneName, i) => {
      const locked = config.lockedTo(sceneName);

      const wide = videos.indexOf(sceneName) !== -1;
      const clazz = wide ? 'wide' : '';

      let order = currentOrder;
      if (wide) {
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
      return html`<santa-card style=${style} locked=${ifDefined(locked)} scene=${sceneName} class="${clazz}"></santa-card>`;
    });

    const placeholders = [];
    for (let i = 0; i < 10; ++i) {
      placeholders.push(html`<div class="placeholder"></div>`);
    }

    return html`
<div id="wrap">
<header>
  <a class="linkwrap" href="./">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="home"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#fff"/><path d="M0 0h24v24H0z" fill="none"/></svg>
    <svg class="logo"><path d="M7.74363885 18.01859504v2.03305785h4.98714095c-.1526676 1.14049591-.5428181 1.97520661-1.1365254 2.56198351-.7294117.7107438-1.86593703 1.4876033-3.85061555 1.4876033-3.07031464 0-5.47058823-2.4132232-5.47058823-5.40495871 0-2.99173554 2.40027359-5.40495868 5.47058823-5.40495868 1.65389877 0 2.86675785.63636364 3.75731875 1.45454546l1.4673051-1.42975207C11.729959 12.14256198 10.0675787 11.25 7.74363885 11.25 3.53679891 11.25 0 14.58884298 0 18.68801653c0 4.09917357 3.53679891 7.43801657 7.74363885 7.43801657 2.27305065 0 3.98632015-.7272728 5.32640215-2.0826447 1.3740082-1.3388429 1.8065664-3.2314049 1.8065664-4.75206609 0-.47107438-.0339261-.90909091-.1102599-1.27272727H7.74363885zm13.36689465-1.65289256c-2.7225718 0-4.9447332 2.01652892-4.9447332 4.80165292 0 2.7603306 2.2221614 4.8016529 4.9447332 4.8016529s4.9447333-2.0330579 4.9447333-4.8016529c0-2.785124-2.2221615-4.80165292-4.9447333-4.80165292zm0 7.71074382c-1.4927496 0-2.7819425-1.1983471-2.7819425-2.9090909 0-1.72727276 1.2891929-2.90909094 2.7819425-2.90909094 1.4927497 0 2.7819426 1.18181818 2.7819426 2.90909094 0 1.7107438-1.2891929 2.9090909-2.7819426 2.9090909zm24.2402189-6.63636366h-.0763338c-.4834473-.56198347-1.4164159-1.07438016-2.5953488-1.07438016-2.4596444 0-4.605472 2.09090909-4.605472 4.80165292 0 2.6942148 2.1458276 4.8016529 4.605472 4.8016529 1.1789329 0 2.1119015-.5123967 2.5953488-1.0909091h.0763338v.6694215c0 1.8347107-1.0093023 2.8181818-2.629275 2.8181818-1.323119 0-2.1458276-.9256199-2.4850889-1.7107438l-1.8829001.7603306c.542818 1.2727272 1.976197 2.8347107 4.367989 2.8347107 2.5359781 0 4.6818058-1.4545455 4.6818058-5v-8.63636364h-2.0525308v.82644628zm-2.4850889 6.63636366c-1.4927497 0-2.629275-1.2396694-2.629275-2.9090909 0-1.6942149 1.1365253-2.90909094 2.629275-2.90909094 1.4757866 0 2.6292749 1.23966942 2.6292749 2.92561984.0084816 1.6776859-1.1534883 2.892562-2.6292749 2.892562zm-10.7291382-7.71074382c-2.7225718 0-4.9447332 2.01652892-4.9447332 4.80165292 0 2.7603306 2.2221614 4.8016529 4.9447332 4.8016529s4.9447332-2.0330579 4.9447332-4.8016529c0-2.785124-2.2221614-4.80165292-4.9447332-4.80165292zm0 7.71074382c-1.4927497 0-2.7819425-1.1983471-2.7819425-2.9090909 0-1.72727276 1.2891928-2.90909094 2.7819425-2.90909094s2.7819426 1.18181818 2.7819426 2.90909094c0 1.7107438-1.2891929 2.9090909-2.7819426 2.9090909zm16.9630643-12.6280992h2.1288646v14.5206612h-2.1288646V11.4483471zm8.702052 12.6280992c-1.1025992 0-1.8829001-.4876033-2.3917921-1.4545455L62 19.96900826l-.2205198-.54545454c-.4071136-1.07438017-1.6623803-3.05785124-4.2153215-3.05785124-2.5359781 0-4.6478796 1.94214876-4.6478796 4.80165292 0 2.6942148 2.0864569 4.8016529 4.8853625 4.8016529 2.2560875 0 3.5622435-1.3471075 4.1050615-2.123967l-1.6793433-1.0909091c-.5597811.7933885-1.323119 1.3223141-2.4257182 1.3223141zm-.1526676-5.90909093c.8735978 0 1.6199726.43801653 1.8659371 1.05785124L55.0621067 21.018595c0-2.01652888 1.4673051-2.85123963 2.5868673-2.85123963z"/></svg>
    <h1><span class="a11y">Google</span> ${_msg`santatracker`}</h1>
  </a>
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

<svg viewBox="0 0 91 119" xmlns="http://www.w3.org/2000/svg">
<path d="M31.5243 56.6205C31.5243 61.4893 27.529 65.3734 22.5487 65.3734C17.6231 65.3734 13.5731 61.4345 13.5731 56.6205C13.5731 51.8064 17.5683 47.8676 22.5487 47.8676C27.4743 47.8676 31.5243 51.7517 31.5243 56.6205Z" fill="#EF9A9A"/>
<path d="M90.1391 56.6205C90.1391 61.4893 86.0892 65.3734 81.1636 65.3734C76.1832 65.3734 72.188 61.4345 72.188 56.6205C72.188 51.8064 76.1832 47.8676 81.1636 47.8676C86.1439 47.8676 90.1391 51.7517 90.1391 56.6205Z" fill="#EF9A9A"/>
<path d="M19.1554 9.57348C19.1554 14.8799 14.8866 19.147 9.57784 19.147C4.26912 19.147 0.000244141 14.8799 0.000244141 9.57348C0.000244141 4.26704 4.26912 0 9.57784 0C14.8866 0 19.1554 4.26704 19.1554 9.57348Z" fill="white"/>
<path d="M51.8287 28.7206C34.2059 28.7206 19.9216 42.9987 19.9216 60.614V92.5073H83.7358V60.614C83.7905 42.9987 69.5062 28.7206 51.8287 28.7206Z" fill="#F1C4A7"/>
<path d="M60.6399 59.0272H0C0 91.6318 26.9815 118.055 60.2568 118.055C60.3115 118.055 60.3662 118.055 60.421 118.055C60.4757 118.055 60.5304 118.055 60.5851 118.055C76.8944 118.055 90.0842 104.871 90.0842 88.5682C90.1389 72.2113 76.9492 59.0272 60.6399 59.0272Z" fill="white"/>
<path d="M58.2314 68.8195C58.2314 72.1018 55.3855 75.22 51.8281 75.22C48.3254 75.22 45.4248 72.1018 45.4248 68.8195H58.2314Z" fill="#212121"/>
<path d="M23.2602 9.40918C23.1507 9.40918 23.2602 9.5733 22.7129 9.5733V47.4843H83.7906C83.7906 26.6962 56.5902 9.40918 23.2602 9.40918Z" fill="#E53935"/>
<path d="M39.077 52.6268C39.077 53.9397 37.9824 55.0338 36.6689 55.0338C35.3554 55.0338 34.2609 53.9397 34.2609 52.6268C34.2609 51.3138 35.3554 50.2197 36.6689 50.2197C38.0372 50.2197 39.077 51.3138 39.077 52.6268Z" fill="#212121"/>
<path d="M64.6348 52.6268C64.6348 53.9397 65.7293 55.0338 67.0428 55.0338C68.3563 55.0338 69.4509 53.9397 69.4509 52.6268C69.4509 51.3138 68.3563 50.2197 67.0428 50.2197C65.6746 50.2197 64.6348 51.3138 64.6348 52.6268Z" fill="#212121"/>
<path d="M83.79 28.7206C86.417 28.7206 88.5514 30.8541 88.5514 33.48V43.0535C88.5514 45.6793 86.417 47.8128 83.79 47.8128H19.9211C17.2941 47.8128 15.1597 45.6793 15.1597 43.0535V33.48C15.1597 30.8541 17.2941 28.7206 19.9211 28.7206H83.79Z" fill="white"/>
<path d="M60.6398 59.0274C60.6398 62.9662 56.6993 66.1938 51.8831 66.1938C47.0122 66.1938 43.1265 62.9662 43.1265 59.0274C43.1265 55.0338 47.067 51.8609 51.8831 51.8609C56.6993 51.8062 60.6398 55.0338 60.6398 59.0274Z" fill="#EF9A9A"/>
</svg>

</div>
</footer>
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
