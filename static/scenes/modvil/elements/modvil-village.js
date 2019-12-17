import {LitElement, html} from "lit-element";
import styles from './modvil-village.css';
import {_static} from '../../../src/magic.js';
import '../../../src/elements/santa-weather.js';
import * as common from '../../../src/core/common.js';


class ModvilVillageConstructor extends LitElement {
  static get styles() { return [styles]; }

  static get properties() {
    return {
      active: {type: Boolean},
    };
  }

  firstUpdated() {
    this._glitch();
  }

  _glitch() {
    const elfGlitch = this.renderRoot.querySelector('.elf-glitch');
    let timeout = 10000;
    if (elfGlitch.classList.contains('glitch')) {
      elfGlitch.classList.remove('glitch');
    } else {
      timeout = 5000;
      elfGlitch.classList.add('glitch');
    }

    window.setTimeout(() => this._glitch(), timeout);
  }


  render() {
    return html`
<div id="top">
  <santa-weather .active=${this.active}></santa-weather>
  <div class="village">
    <div class="layer1">
    </div>
    <div class="layer2">
      <div class="elfski1" @animationiteration=${() => this._play('village_top_skier')}></div>
      <div class="elfski2"></div>
    </div>
    <div class="layer3">
      <div class="elf-glitch">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="elfbike4"></div>
      <div class="elfbike6"></div>
      <div class="elfbike2"></div>
      <div class="elfbike3"></div>
      <div class="elfbike5"></div>
      <div class="elfbike1"></div>
      <div class="elfchair"></div>
      <div class="elfboard1" @animationiteration=${() => this._play('village_top_bikeride')}></div>
      <div class="elfboard2"></div>
    </div>
    <div class="layer4">
      <a href="retro.html" class="retro"></a>
      <div class="peekaboo" @animationiteration=${() => this._play('village_top_surprise')}>
        <div class="peekaboo-elf"></div>
        <div class="peekaboo-tree"></div>
      </div>
      <div class="waterspout">
        <div class="waterspout-bottom" @animationiteration=${() => this._play('village_top_fountain')}></div>
        <div class="waterspout-top"></div>
      </div>
      <div class="snowman-build">
        <div class="snowman-build-bottom"></div>
        <div class="snowman-build-top"></div>
      </div>
    </div>
  </div>
  <header>
    <div class="ornament"></div>
    <slot></slot>
  </header>
</div>
<div id="top-divider"></div>
    `;
  }

  _play(name) {
    if (this.active) {
      common.play(name);
    }
  }
}

customElements.define('modvil-village', ModvilVillageConstructor);
