import {html, LitElement} from 'lit-element';
import styles from './santa-overlay.css';

const supportsShare = Boolean(navigator.share);


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

      _longUrl: {type: String},
      _shortUrl: {type: String},
    };
  }

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  _dispatchResume() {
    this.dispatchEvent(new Event('resume'));
  }

  _dispatchRestart() {
    this.dispatchEvent(new Event('restart'));
  }

  _dispatchHome() {
    this.dispatchEvent(new Event('home'));
  }

  update(changedProperties) {
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

  _shareWebShare() {
    navigator.share({
      title: this._shareTitle(),
      url: this._shareUrl(),
    });
  }

  _shareFacebook() {
    const enc = window.encodeURIComponent(this._shareUrl());
    this._open(`https://facebook.com/sharer.php?p[url]=${enc}`);
  }

  _shareTwitter() {
    const enc = window.encodeURIComponent(this._shareUrl());
    const title = this._shareTitle();
    this._open(`https://twitter.com/intent/tweet?hashtags=santatracker&text=${window.encodeURIComponent(title)}&url=${enc}`);
  }

  _open(url) {
    const opts = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=800,height=600';
    window.open(url, '', opts);
  }

  render() {
    const heroClass = 'gameover';
    const hasData = this.data && Object.keys(this.data).length;

    const url = this._url || 'https://santatracker.google.com';
//   <santa-button color="purple" @click="${this._dispatchResume}">play_arrow</santa-button>

    return html`
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
    <santa-button color="purple" @click="${this._dispatchRestart}">refresh</santa-button>
    <santa-button color="purple" @click="${this._dispatchHome}" data-action="home">home</santa-button>
    <santa-button data-share="share" ?hidden=${!supportsShare} @click=${this._shareWebShare}>share</santa-button>
    <santa-button data-share="facebook" ?hidden=${supportsShare} @click=${this._shareFacebook}>
      <svg viewBox="-0.5 0 11 20"><path d="M2.9 19.7v-8.8H0V7.4h3V4.9C3 2 4.8.4 7.4.4c1.3 0 2.3.1 2.7.1v3.1H8.3c-1.4 0-1.7.7-1.7 1.7v2.2H10l-.4 3.4h-3v8.8H2.9z"></path></svg>
    </santa-button>
    <santa-button data-share="twitter" ?hidden=${supportsShare} @click=${this._shareTwitter}>
      <svg viewBox="-1 -0.5 22 18"><path d="M21.8 2.3c-.8.4-1.7.6-2.6.7.9-.5 1.6-1.4 1.9-2.4-.9.5-1.8.9-2.8 1.1-.8-.9-2-1.4-3.2-1.4-2.4 0-4.4 2-4.4 4.4 0 .3 0 .7.1 1-3.6-.2-6.9-2-9.1-4.7-.4.7-.6 1.5-.6 2.3 0 1.5.8 2.9 2 3.7-.7 0-1.4-.2-2-.6v.1c0 2.1 1.5 3.9 3.6 4.3-.4.1-.8.2-1.2.2-.3 0-.6 0-.8-.1.6 1.8 2.2 3 4.1 3.1-1.5 1.2-3.4 1.9-5.5 1.9-.4 0-.7 0-1.1-.1 2 1.3 4.3 2 6.8 2 8.1 0 12.6-6.7 12.6-12.6v-.6c.8-.6 1.6-1.4 2.2-2.3z"></path></svg>
    </santa-button>
  </div>
</nav>
</div>
`;
  }
}


customElements.define('santa-overlay', SantaOverlayElement);
