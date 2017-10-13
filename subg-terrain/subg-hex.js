export class SubgHex extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
<style>
@keyframes rise {
  0% {
    transform: translateY(0) scale(1);
  }

  90% {
    transform: translateY(0px) scale(1);
  }

  100% {
    transform: translateY(-10px) scale(0.1);
  }
}

@keyframes submerge {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  50% {
    transform: translateY(12px) scale(1);
    opacity: 1;
  }

  70% {
    opacity: 0.5;
  }

  100% {
    transform: translateY(6px) scale(0.5);
    opacity: 0;
  }
}

:host {
  display: block;
  position: absolute;
  width: 40px;
  height: 40px;
  overflow: hidden;
}

#land {
  display: block;
  width: 100%;
  height: 100%;
  background-image: url('/subg-terrain/hex_land@2x.png');
  background-size: 100%;
}

#water {
  display: block;
  position: absolute;
  background-image: url('/subg-terrain/hex_water@2x.png');
  width: 40px;
  height: 27px;
  bottom: -12px;
  background-size: 100%;
}

:host(.sunk) #land {
  animation: submerge 0.5s forwards linear;
}

:host(.sunk) #water {
  /*animation: rise 0.5s forwards linear;*/
}
</style>
<div id="land"></div>
<div id="water"></div>
`;
  }

  connectedCallback() {
    this.addEventListener('click', () => this.sink());
  }

  set position(cube) {
    const width = 40;
    const height = 30;
    const wSize = width / 2;
    const hSize = height / 2;

    const xB = [0, 0];
    const yB = [-1.5, 1];
    const zB = [-1.5, -1];

    const x = wSize * yB[0] * cube.y + wSize * zB[0] * cube.z;
    const y = hSize * yB[1] * cube.y + hSize * zB[1] * cube.z;

    this.style.zIndex = 100 - cube.toAxial().r;
    this.style.transform = `translate(${x}px, ${y}px)`;
  }

  sink() {
    this.classList.add('sunk');
    let handler = event => {
      this.shadowRoot.removeEventListener('animationend', handler);
      console.log('Animation end!');
      this.parentNode.removeChild(this);
    }
    this.shadowRoot.addEventListener('animationend', handler);
  }
};


customElements.define('subg-hex', SubgHex);
