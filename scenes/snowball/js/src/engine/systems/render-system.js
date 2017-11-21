const {
  WebGLRenderer,
} = self.THREE;

export class RenderSystem extends HTMLElement {
  get aspectRatio() {
    return this.width / this.height;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
<style>
  :host, canvas {
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    pointer-events: none;
  }
</style>`;

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

customElements.define('render-system', RenderSystem);
