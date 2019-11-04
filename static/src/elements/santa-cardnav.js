import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import styles from './santa-cardnav.css';
import {_static} from '../magic.js';

import {sceneDefs} from './santa-card.js';  // and for side-effects


const cards = 'jetpack jamband snowball elfmaker codelab wrapbattle penguindash museum boatload takeoff gumball presentbounce reindeerworries glider speedsketch santascanvas seasonofgiving penguinproof traditions wheressanta santasearch translations runner'.split(/\s+/g);


export class SantaCardNavElement extends LitElement {
  static get properties() {
    return {
      _cols: {type: Number},
    };
  }

  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this._onWindowResize = this._onWindowResize.bind(this);
  }

  _onWindowResize() {
    const width = this.offsetWidth || window.innerWidth;
    const itemSize = ((width < 768) ? 130 : 200) + 20;  // css width + padding
    this._cols = Math.max(2, Math.min(6, Math.floor(width / itemSize)));  // put between 2-6 inclusive
  }

  connectedCallback() {
    super.connectedCallback();

    window.addEventListener('resize', this._onWindowResize);
    this._onWindowResize();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('resize', this._onWindowResize);
  }

  render() {
    let currentOrder = 0;
    const available = [];

    const cardHtml = cards.map((sceneName, i) => {
      let locked = undefined;

      const def = sceneDefs[sceneName];

      const wide = Boolean(def && def.mode === 'video');
      const clazz = wide ? 'wide' : '';

      if (Math.random() < 0.125) {
        locked = ~~(Math.random() * 23) + 1;
      }

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
<div class="reveal"></div>
<main>${cardHtml}${placeholders}</main>
<footer>
</fotter>
    `;
  }
}

customElements.define('santa-cardnav', SantaCardNavElement);
