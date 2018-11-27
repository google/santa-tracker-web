import {html, LitElement} from '@polymer/lit-element';

const delay = (ms) => new Promise((r) => window.setTimeout(r, ms));

const FLIGHT_TIME = 30000;
const RANDOM_EGG_WAIT_MIN = 5000;
const RANDOM_EGG_WAIT_MAX = 30000;

export class HotAirBalloonElement extends LitElement {
  static get properties() {
    return {
        flying: {type: Boolean},
    };
  }

  constructor() {
    super();

    this.flying = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this.randomlyFly_();
  }

  randomlyFly_() {
    if (!this.isConnected) {
      return;
    }
    window.clearTimeout(this.flyTimout_);

    const timeout = RANDOM_EGG_WAIT_MIN + (Math.random() * RANDOM_EGG_WAIT_MAX);

    this.flyTimeout_ = window.setTimeout(() => {
      this.fly();
    }, timeout);
  }


  async fly(e) {
    e && e.preventDefault();

    if (!this.flying) {
      window.clearTimeout(this.flyTimeout_);
      this.flying = true;

      await delay(FLIGHT_TIME);

      this.flying = false;
      this.randomlyFly_();
    }
  }

  update(changedProperties) {
    super.update(changedProperties);
  }

  render() {
    return html`
    <style>${_style`hotairballoon`}</style>
    <div class="${this.flying ? 'flying' : ''}">
      <a href="#" @click="${(e) => this.fly(e)}" class="balloon"></a>
      <div class="balloon-ropes"></div>
      <div class="balloon-flight"></div>
    </div>
    `;
  }
}

customElements.define('hotair-balloon', HotAirBalloonElement);
