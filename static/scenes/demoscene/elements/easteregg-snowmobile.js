import {html, LitElement} from 'lit-element';
import styles from './easteregg-snowmobile.css';

const delay = (ms) => new Promise((r) => window.setTimeout(r, ms));

const DRIVE_TIME = 11000;
const RANDOM_EGG_WAIT_MIN = 5000;
const RANDOM_EGG_WAIT_MAX = 30000;

export class EasterEggSnowMobileElement extends LitElement {
  static get properties() {
    return {
        driving: {type: Boolean},
        direction: {type: String},
        color: {type: String},
    };
  }

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];

    this.driving = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this.randomlyDrive_();
  }

  randomlyDrive_() {
    if (!this.isConnected) {
      return;
    }
    window.clearTimeout(this.driveTimeout_);

    const timeout = RANDOM_EGG_WAIT_MIN + (Math.random() * RANDOM_EGG_WAIT_MAX);

    this.flyTimeout_ = window.setTimeout(() => {
      this.drive();
    }, timeout);
  }


  async drive(e) {
    e && e.preventDefault();

    if (!this.driving) {
      window.clearTimeout(this.driveTimeout_);
      this.driving = true;

      await delay(DRIVE_TIME);

      this.driving = false;
      this.randomlyDrive_();
    }
  }

  update(changedProperties) {
    super.update(changedProperties);
  }

  render() {
    return html`
<a href="#" @click="${(e) => this.drive(e)}" class="snowmobile ${this.driving ? 'drive' : ''} ${this.direction}">
  <span class="${this.color}"></span>
</a>
    `;
  }
}

customElements.define('easteregg-snowmobile', EasterEggSnowMobileElement);
