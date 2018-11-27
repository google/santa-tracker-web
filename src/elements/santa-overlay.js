import {html, LitElement} from '@polymer/lit-element';


const supportsShare = Boolean(navigator.share);


export class SantaOverlayElement extends LitElement {
  static get properties() {
    return {
      score: {type: Number},
      shareUrl: {type: String},
    };
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

  render() {
    // TODO: proper paused state
    let heroClass = 'gameover';
    if (this.shareUrl) {
      heroClass = 'share';
    }
//   <santa-button color="purple" @click="${this._dispatchResume}">play_arrow</santa-button>

    return html`
<style>${_style`santa-overlay`}</style>
<div class="wrap">
<div class="hero ${heroClass}">
  <div class="score" ?hidden="${this.score < 0}">
    <h1>${_msg`gameover_score`}</h1>
    <h2>${this.score}</h2>
  </div>
</div>
<nav>
  <santa-button color="purple" @click="${this._dispatchRestart}">refresh</santa-button>
  <santa-button color="purple" @click="${this._dispatchHome}" data-action="home">home</santa-button>
  <santa-button data-share="share" ?hidden=${!supportsShare}>share</santa-button>
  <santa-button data-share="facebook" ?hidden=${supportsShare}>
    <svg viewBox="-0.5 0 11 20"><path d="M2.9 19.7v-8.8H0V7.4h3V4.9C3 2 4.8.4 7.4.4c1.3 0 2.3.1 2.7.1v3.1H8.3c-1.4 0-1.7.7-1.7 1.7v2.2H10l-.4 3.4h-3v8.8H2.9z"></path></svg>
  </santa-button>
  <santa-button data-share="twitter" ?hidden=${supportsShare}>
    <svg viewBox="-1 -0.5 22 18"><path d="M21.8 2.3c-.8.4-1.7.6-2.6.7.9-.5 1.6-1.4 1.9-2.4-.9.5-1.8.9-2.8 1.1-.8-.9-2-1.4-3.2-1.4-2.4 0-4.4 2-4.4 4.4 0 .3 0 .7.1 1-3.6-.2-6.9-2-9.1-4.7-.4.7-.6 1.5-.6 2.3 0 1.5.8 2.9 2 3.7-.7 0-1.4-.2-2-.6v.1c0 2.1 1.5 3.9 3.6 4.3-.4.1-.8.2-1.2.2-.3 0-.6 0-.8-.1.6 1.8 2.2 3 4.1 3.1-1.5 1.2-3.4 1.9-5.5 1.9-.4 0-.7 0-1.1-.1 2 1.3 4.3 2 6.8 2 8.1 0 12.6-6.7 12.6-12.6v-.6c.8-.6 1.6-1.4 2.2-2.3z"></path></svg>
  </santa-button>
</nav>
</div>
`;
  }
}


customElements.define('santa-overlay', SantaOverlayElement);
