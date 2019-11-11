import {html, LitElement} from 'lit-element';
import styles from './santa-overlay.css';
import {_msg} from '../magic.js';
import './santa-button.js';


function shortenUrl(url) {
  const key = 'AIzaSyA4LaOn5d1YRsJIOTlhrm7ONbuJ4fn7AuE';

  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('POST', 'https://www.googleapis.com/urlshortener/v1/url?key=' + key);
    x.responseType = 'json';
    x.onload = () => resolve(x.response['id'] || url);
    x.onerror = () => reject(x.responseText);
    x.setRequestHeader('Content-Type', 'application/json');
    x.send(JSON.stringify({longUrl: url}));
  });
}


export class SantaOverlayElement extends LitElement {
  static get properties() {
    return {
      score: {type: Number},
      shareUrl: {type: String},
      scene: {type: String},
      data: {type: Object},
      state: {type: Object},

      _longUrl: {type: String},
      _shortUrl: {type: String},
    };
  }

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  _dispatchRestart(e) {
    const detail = {type: 'restart'};
    // TODO(sambecker) Scope this event propagation to something smaller than 'window'
    window.dispatchEvent(new CustomEvent('game-restart'), {
      detail,
      bubbles: true,
      composed: true,
    });
  }

  _dispatchResume() {
    this.dispatchEvent(new Event('resume'));
  }

  _dispatchHome() {
    // FIXME: This should be a real link.
    const link = document.createElement('a');
    link.href = './';
    this.append(link);
    link.click();
    link.remove();
  }

  update(changedProperties) {
    if (changedProperties.has('state')) {
      this.score = this.state.score.score;
    }

    if (changedProperties.has('data')) {
      let longUrl = 'https://santatracker.google.com';
      if (this.scene) {
        longUrl += `/${this.scene}.html`;
      }

      const u = new URL(longUrl);
      let hasData = false;
      if (this.data) {
        for (const k in this.data) {
          hasData = true;
          u.searchParams.set(k, this.data[k]);
        }
        longUrl = u.toString();
      }
      const change = (this._longUrl !== longUrl);

      if (change) {
        this._longUrl = longUrl;
        this._shortUrl = longUrl;

        if (hasData) {
          const p = shortenUrl(longUrl).catch((err) => {
            console.warn('err shortening URL', err);
            return longUrl;
          }).then((url) => {
            if (this._longUrl === longUrl) {
              this._shortUrl = url;
            }
          });
        }
      }
    }

    return super.update(changedProperties);
  }

  _copyUrl(ev) {
    ev.target.select();
    document.execCommand('copy');
    ev.target.setSelectionRange(0, 0);

    const url = ev.target.parentNode;
    url.classList.add('copy');
    window.setTimeout(() => {
      url.classList.remove('copy');
    }, 1000);
  }

  _getScene() {
    return window.location.pathname.split('.')[0].slice(1);
  }

  _shareTitle() {
    if (this.scene) {
      // FIXME(samthor): get name of scene
      return `${this.scene} — ${_msg`santatracker`}`;
    }
    return _msg`santatracker`;
  }

  _shareUrl() {
    return this._shortUrl || this._longUrl;
  }

  render() {
    const heroClass = 'gameover';
    const hasData = this.data && Object.keys(this.data).length;

    return html`
<div class="shim"></div>
<div class="wrap">
<div class="hero ${heroClass}">
  <div class="score" ?hidden="${this.score < 0}">
    <h1>${_msg`gameover_score`}</h1>
    <h2>${this.score}</h2>
  </div>
</div>
<nav>
  <div class="url" ?hidden=${!hasData}>
    <input type="text" value=${this._shareUrl()} readonly @click=${this._copyUrl} />
  </div>
  <div class="buttons">
    <santa-button color="purple" @click="${this._dispatchRestart}">
    </santa-button>
    <santa-button color="purple" @click="${this._dispatchHome}" data-action="home">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#fff"/><path d="M0 0h24v24H0z" fill="none"/></svg>
    </santa-button>
  </div>
</nav>
</div>
`;
  }
}


customElements.define('santa-overlay', SantaOverlayElement);