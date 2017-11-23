import { BasicElement } from '../utils/basic-element.js';

const {
  WebGLRenderer,
} = self.THREE;

const template = document.createElement('template');

template.innerHTML = `
<style>
  :host, canvas {
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    pointer-events: none;
  }
</style>
`;

export class RenderSystem extends BasicElement {
  static get is() { return 'render-system'; }

  static get template() { return template }

  get aspectRatio() {
    return this.width / this.height;
  }

  constructor() {
    super();

    this.stampTemplate();
    this.renderer = new WebGLRenderer();
    this.renderer.autoClear = true;
    this.shadowRoot.appendChild(this.renderer.domElement);
  }

  measure(game) {
    this.width = self.innerWidth;
    this.height = self.innerHeight;

    this.renderer.setPixelRatio(self.devicePixelRatio);
    this.renderer.setSize(this.width, this.height, true);
  }

  update(game) {
    const { currentLevel, camera } = game;
    this.renderer.render(currentLevel, camera);
  }

  clear() {
    this.renderer.clearColor();
  }
};

customElements.define(RenderSystem.is, RenderSystem);
