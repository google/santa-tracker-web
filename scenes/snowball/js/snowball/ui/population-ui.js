import { BasicElement } from '../../engine/utils/basic-element.js';
import { Entity } from '../../engine/core/entity.js';

/**
 * @constructor
 * @extends {BasicElement}
 * @implements {EntityInterface}
 */
const EntityElement = Entity(BasicElement);

const template = document.createElement('template');

template.innerHTML = `
<style>
:host {
  position: absolute;
  top: 0;
  right: 0;
}

#container {
  padding: 1em;
  margin: 3em;
  text-align: center;
  color: #fff;
  background-color: #68E4C1;
  font-family: Lobster;
  border-radius: 6px;
  box-shadow: 0px 5px 0px rgba(204, 204, 204, 0.5);
}

h1 {
  font-size: 4em;
  margin: 0;
}

h2 {
  margin: 0;
}
</style>
<div id="container">
  <h1><span id="remaining">0</span>/<span id="maximum">100</span></h1>
  <h2>Elves Remaining</h2>
</div>
`;

export class PopulationUi extends EntityElement {
  static get is() { return 'population-ui'; }

  static get template() { return template; }

  constructor(...args) {
    super(...args);
    this.stampTemplate();
    this.remainingEl = this.shadowRoot.querySelector('#remaining');
    this.maximumEl = this.shadowRoot.querySelector('#maximum');
    this.remaining = this.maximum = 0;
  }

  update(game) {
    super.update(game);

    const { stateSystem } = game;
    const { population } = stateSystem;

    const { knockedOut, maximum } = population;
    const remaining = maximum - knockedOut;

    if (remaining !== this.remaining) {
      this.remaining = remaining;
      this.remainingEl.textContent = remaining;
    }

    if (maximum !== this.maximum) {
      this.maximum = maximum;
      this.maximumEl.textContent = maximum;
    }
  }
}

customElements.define(PopulationUi.is, PopulationUi);
