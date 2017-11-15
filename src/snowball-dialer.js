import { SantaSocket } from './santa-socket.js';

export class DialerElement extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
<style>
  :host {
  }
  #ui {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #ui div {
    line-height: 24px;
    font-size: 12px;
    display: flex;
    align-items: center;
  }
  #ui div label {
    flex-grow: 1;
    padding-left: 6px;
  }
  #clouds {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
<div id="ui">
  <form id="form">
    <div>
      <input type="radio" id="offline" name="server" value="" checked />
      <label for="offline">&mdash; (offline)</label>
    </div>
    <div>
      <input type="radio" id="localhost" name="server" value="ws://localhost:8080/socket" />
      <label for="localhost">ws://localhost:8080/socket</label>
    </div>
    <div>
      <input type="radio" id="remote" name="server" value="wss://game-dot-next-santa-api/socket" />
      <label for="remote">wss://game-dot-next-santa-api/socket</label>
    </div>
    <div>
      <button>Start</button>
    </div>
  </form>
</div>
`;

    const form = this.shadowRoot.getElementById('form');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);

      if (!fd.get('server')) {
        this.dispatchEvent(new CustomEvent('start', {bubbles: true, detail: null}));
        return;
      }

      const s = new SantaSocket(fd.get('server'), 'snowball');
      s.onready = () => {
        s.onready = null;
        this.dispatchEvent(new CustomEvent('start', {bubbles: true, detail: s}));
      };

    });
  }
}

customElements.define('snowball-dialer', DialerElement);
