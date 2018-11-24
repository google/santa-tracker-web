import {html, LitElement} from '@polymer/lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';


export class InfoCardElement extends LitElement {
  static get properties() {
    return {
      locked: {type: Boolean},
      opens: {type: String},
      href: {type: String},
      type: {type: String},
      src: {type: String},
    };
  }

  _determineInfo() {
    if (this.locked) {
      // locked
      if (this.opens === 'tracker') {
        return `Opens December 24th`;
      }
      return `Opens soon`;

    } else {
      // not locked
      if (this.opens === 'all') {
        return `Open all December`;
      }
      return `Open now`;
    }
  }

  render() {
    return html`
<style>${_style`info-card`}</style>
<div class="card">
<a href=${ifDefined(undefined)}>
  <div class="background" style="background-image: url(${this.src})">
    <div class="lock" ?hidden=${!this.locked}>
    </div>
  </div>
</a>
<div class="info">
  <h4><slot name="title"></slot></h4>
  <h5>${this._determineInfo()}</h5>
  <slot></slot>
</div>
</div>
`;
  }
}

customElements.define('info-card', InfoCardElement);
