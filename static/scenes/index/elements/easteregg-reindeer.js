import {html, LitElement} from 'lit-element';
import styles from './easteregg-reindeer.css';

export class EasterEggReindeerElement extends LitElement {
  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  render() {
    return html`
<div id="holder">
  <div id="wrangler">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div id="reindeer1">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div id="reindeer2">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
    `;
  }
}

customElements.define('easteregg-reindeer', EasterEggReindeerElement);
