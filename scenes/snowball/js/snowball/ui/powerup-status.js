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
    display: block;
    position: absolute;
    border-radius: 100%;
    width: 128px;
    height: calc(209/201 * 128px);
    background-image: url(scenes/snowball/img/item-frame.png);
    background-size: 100%;
    pointer-events: all;
  }

  .icon {
    position: absolute;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    width: 72px;
    height: 72px;
    top: 28px;
    left: 28px;
    background-size: 100%;
  }

  :host(.one) #one,
  :host(.two) #two,
  :host(.three) #three {
    opacity: 1;
  }

  :host(.two) #one {
    transform: scale(0.6) translate(-55%, -10%);
  }

  :host(.two) #two {
    transform: scale(0.6) translate(55%, 10%);
  }

  :host(.two.three) #one {
    transform: scale(0.5) translate(-40%, -40%);
  }

  :host(.two.three) #two {
    transform: scale(0.6) translate(45%, -10%);
  }

  :host(.three) #three {
    transform: scale(0.8) translate(0, 17.5%);
  }

  :host(.powerup-1) .icon {
    background-image: url(scenes/snowball/img/powerup-1.png);
  }
</style>
<div id="one" class="icon"></div>
<div id="two" class="icon"></div>
<div id="three" class="icon"></div>`;

export class PowerupStatus extends EntityElement {
  static get is() { return 'powerup-status'; }

  static get template() { return template; }

  constructor(...args) {
    super(...args);

    this.powerup = null;
    this.currentQuantity = 0;
  }

  set value(powerup) {
    if (powerup == null) {
      this.powerup = powerup;
      this.currentQuantity = 0;
      this.classList.remove('one', 'two', 'three');
      return;
    }

    if (this.currentQuantity !== powerup.quantity) {
      this.classList.toggle('one', powerup.quantity >= 1);
      this.classList.toggle('two', powerup.quantity >= 2);
      this.classList.toggle('three', powerup.quantity >= 3);
      this.currentQuantity = powerup.quantity;
    }

    if (this.powerup === powerup) {
      return;
    }

    if (this.powerup != null) {
      this.classList.remove(`powerup-${this.powerup.type}`);
    }

    if (powerup != null) {
      this.classList.add(`powerup-${powerup.type}`);
    }

    this.powerup = powerup;
  }
};

customElements.define(PowerupStatus.is, PowerupStatus);
