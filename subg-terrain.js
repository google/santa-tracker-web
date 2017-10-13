import './subg-terrain/subg-hex.js';
import { Cube, Axial } from './hexlib.js';

export class SubgTerrain extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
<style>
:host {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #62A8E0;
  overflow: hidden;
}

#grid {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translate(50%, 50%);
}
</style>
<section id="grid"></section>
`;

    this.grid = [];
  }

  connectedCallback() {
    this.generateMap();
  }

  generateMap() {
    const container = this.shadowRoot.querySelector('#grid');
    const rect = this.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const x0 = width / 2;
    const y0 = height / 2;

    const position = new Cube();

    for (let y = -10; y < 11; y++) {
      for (let z = -10; z < 11; z++) {
        position.set(0, y, z);

        const radius = position.radius;
        const skip = radius < 6
            ? false
            : Math.random() < (radius / 10 * radius / 10);

        if (skip) {
          continue;
        }

        if (this.grid[radius] == null) {
          this.grid[radius] = [];
        }

        const ring = this.grid[radius];
        const hex = document.createElement('subg-hex');

        ring.push(hex);

        hex.position = position;

        container.appendChild(hex);
      }
    }

    let lastShrink = performance.now();

    const shrink = () => {
      const time = performance.now();

      if ((time - lastShrink) > 100) {
        lastShrink = time;

        if (Math.random() > 0.5) {
          const ring = this.grid[this.grid.length - 1];
          const index = Math.floor(Math.random() * ring.length);

          ring.splice(index, 1).pop().sink();

          if (ring.length === 0) {
            this.grid.pop();
          }
        }
      }

      if (this.grid.length) {
        requestAnimationFrame(shrink);
      }
    };

    shrink();
    /*
    for (let q = -4; q < 5; q++) {
      for (let r = -4; r < 5; r++) {
        const position = new Axial(q, r);
          //position.set(x, y, z);

        const hex = document.createElement('subg-hex');

        hex.position = position.toCube();

        container.appendChild(hex);
      }
    }
    */
  }

}

customElements.define('subg-terrain', SubgTerrain);
