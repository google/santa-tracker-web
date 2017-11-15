import { Entity } from '../../engine/core/entity.js';
import { PowerupStatus } from './powerup-status.js';

export class PowerupUi extends Entity(HTMLElement) {
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
  overflow: visible;
  box-sizing: border-box;
  border-top: 1px solid #333;
}

powerup-status {
  transition: transform 0.3s;
}

:host(.swap) #powerupTwo,
#powerupOne {
  transform: translate(40%, -140%);
  z-index: 2;
}

:host(.swap) #powerupOne,
#powerupTwo {
  transform: scale(calc(1/2)) translate(180%, -230%);
  z-index: 1;
}

:host(.swap:not(.has-active)) #powerupTwo,
:host(:not(.swap):not(.has-active)) #powerupOne {
  transform: translate(40%, 0);
}

:host(.swap:not(.has-inactive)) #powerupOne,
:host(:not(.swap):not(.has-inactive)) #powerupTwo {
  transform: scale(calc(1/2)) translate(180%, 0);
}

</style>
<powerup-status id="powerupOne"></powerup-status>
<powerup-status id="powerupTwo"></powerup-status>`;

    this.powerupOne = this.shadowRoot.querySelector('#powerupOne');
    this.powerupTwo = this.shadowRoot.querySelector('#powerupTwo');
    this.swapped = false;
    this.swapRequested = false;

    this.addEventListener('click', event => {
      this.swapRequested = true;
    })
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
