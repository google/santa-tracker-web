import { Entity } from '../../engine/core/entity.js';
import { PowerupStatus } from './powerup-status.js';

/**
 * @constructor
 * @extends {HTMLElement}
 * @implements {EntityInterface}
 */
const EntityElement = Entity(HTMLElement);

export class PowerupUi extends EntityElement {
  constructor(...args) {
    super(...args);

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
<style>
:host {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  height: 265px;
  width: 212px;
  overflow: hidden;
  box-sizing: border-box;
  pointer-events: none;
}

powerup-status {
  transition: transform 0.3s;
}

:host(.swap) #powerupTwo,
#powerupOne {
  transform: translate(40%, 0%);
  z-index: 2;
}

:host(.swap) #powerupOne,
#powerupTwo {
  transform: scale(calc(1/2)) translate(180%, 50%);
  z-index: 1;
}

:host(.swap:not(.has-active)) #powerupTwo,
:host(:not(.swap):not(.has-active)) #powerupOne {
  transform: translate(40%, 200%);
}

:host(.swap:not(.has-inactive)) #powerupOne,
:host(:not(.swap):not(.has-inactive)) #powerupTwo {
  transform: scale(calc(1/2)) translate(180%, 350%);
}

@media (max-width: 768px) {
  :host {
    transform-origin: bottom left;
    transform: scale(0.7);
  }
}

</style>
<powerup-status id="powerupOne"></powerup-status>
<powerup-status id="powerupTwo"></powerup-status>`;

    this.powerupOne = this.shadowRoot.querySelector('#powerupOne');
    this.powerupTwo = this.shadowRoot.querySelector('#powerupTwo');
    this.swapped = false;
    this.swapRequested = false;

    // NOTE(cdata): We are disabling swapping as a design decision, but
    // keeping this around in case we want to test it later:
    //this.addEventListener('click', event => {
      //this.swapRequested = true;
    //})
  }

  swap() {
    this.swapped = !this.swapped;
    this.classList.toggle('swap', this.swapped);
  }

  get activePowerup() {
    return this.swapped
        ? this.powerupTwo
        : this.powerupOne;
  }

  get inactivePowerup() {
    return this.swapped
        ? this.powerupOne
        : this.powerupTwo;
  }

  update(game) {
    const { clientSystem } = game;
    const { player } = clientSystem;

    if (player == null) {
      return;
    }

    const { powerups } = player;

    this.classList.toggle('has-active', powerups.active != null);
    this.classList.toggle('has-inactive', powerups.inactive != null);

    if (this.swapRequested && powerups.inactive != null) {
      powerups.swapped = !powerups.swapped;
    }

    this.swapRequested = false;

    if (powerups.swapped != this.swapped) {
      this.swap();
    }

    this.activePowerup.value = powerups.active;
    this.inactivePowerup.value = powerups.inactive;
  }
};

customElements.define('powerup-ui', PowerupUi);
