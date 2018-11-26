import {html, svg, LitElement} from '@polymer/lit-element';
import {render} from 'lit-html';
import * as defs from '../defs.js';


function interpolateAngle(start, c1, c2, end) {
	return (t) => {
    const tangentX =
      (3 * Math.pow(1 - t, 2) * (c1.x - start.x)) +
      (6 * (1 - t) * t * (c2.x - c1.x)) +
      (3 * Math.pow(t, 2) * (end.x - c2.x));
    const tangentY =
      (3 * Math.pow(1 - t, 2) * (c1.y - start.y)) +
      (6 * (1 - t) * t * (c2.y - c1.y)) +
      (3 * Math.pow(t, 2) * (end.y - c2.y));
    return Math.atan2(tangentY, tangentX) * (180 / Math.PI);
  }
}


export class MakerElfElement extends LitElement {
  static get properties() {
    return {
      svgStyle: {type: String},
      categoryChoice: {type: Object},
      _offset: {type: Number},
    };
  }

  constructor() {
    super();
    this._offset = 0;
  }

  _buildArm(angle=0, shrug=1, length=120) {
    const rads = (angle / 180) * Math.PI;
    const offset = {x: Math.sin(rads) * length, y: Math.cos(rads) * length};

    const bodyControl = {x: shrug * -50, y: 0};  // 40.51 goes away from start arm
    const handControl = {x: -81.2, y: 29.27};

    const interpolate = interpolateAngle(
      {x: 0, y: 0},
      bodyControl,
      handControl,
      {x: -offset.x, y: offset.y},
    );
    const angleAt = interpolate(1) - 90;

    return svg`
<path class="limb" d="M0,0c${bodyControl.x},${bodyControl.y},${handControl.x},${handControl.y},${-offset.x},${offset.y}"/>
<g transform="translate(${-offset.x}, ${offset.y}) rotate(${angleAt})">
  <circle class="skin" cx="0" cy="0" r="21.32"/>
  <path transform="translate(-48.8, -303.89)" class="white" d="M66.87,272.56H30.73a10,10,0,0,0,0,20H66.87a10,10,0,0,0,0-20Z"/>
</g>
    `;
  }

  connectedCallback() {
    const run = () => {
      if (!this.isConnected) {
        return;
      }
      window.requestAnimationFrame(run);
      this._offset = (performance.now() / 1000);
    };
    run();
  }

  /**
   * @return {!Promise<string>}
   */
  draw() {
    const canvas = document.createElement('canvas');
    canvas.width = 280;  // matches the SVG size in <style> below
    canvas.height = 400;

    // create div, find the svg
    const div = document.createElement('div');
    render(this.render(), div);
    const svg = div.querySelector('svg');

    // load an Image with the base64 version of the SVG
    const raw = 'data:image/svg+xml;base64,' + window.btoa(svg.outerHTML);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = raw;
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.onerror = reject;
    });
  }

  render() {
    const rightArmDegrees = 100 + (50 * Math.cos(this._offset / 0.8));
    const leftArmDegrees = 135 + (10 * Math.sin(this._offset * 1.5));
    const shrug = (Math.cos(this._offset) + 1) / 2;
    const bodyDegrees = (Math.cos(this._offset) * 0.5) * 10;

    return html`
<style>
svg {
width: 280px;
}
</style>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 320 460" style="filter: drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.125))">
  <style>${defs.baseSvgStyle}${this.svgStyle}</style>

  <g transform="translate(130, 0) rotate(${bodyDegrees}, 0, 280)">
    <g transform="translate(-105, -25)">
      ${defs.hats[this.categoryChoice['hats']]}
    </g>

    <!-- head -->
    <g transform="translate(-105, -18)">
      ${defs.head}
    </g>

    <!-- body -->
    <path transform="translate(-130, 0)" class="suit" d="M130,202.7a42.66,42.66,0,0,0-42.65,42.65v35.74a42.65,42.65,0,1,0,85.3,0V245.35A42.66,42.66,0,0,0,130,202.7Z"/>

    <!-- belt -->
    <rect class="high1" x="-42.65" y="259.76" width="85.3" height="21.32"/>
    <rect class="high2" x="-10.66" y="258.76" width="21.32" height="23.32"/>

    <!-- left arm -->
    <g transform="translate(-10, 216) scale(1, -1)">
      ${this._buildArm(leftArmDegrees, shrug)}
    </g>

    <!-- right arm -->
    <g transform="translate(+10, 216) scale(-1, -1)">
      ${this._buildArm(rightArmDegrees, shrug)}
    </g>
  </g>

  <!-- legs -->
  <path class="limb" d="M112.51,301.25v78.69"/>
  <path class="limb" d="M147.49,301.25v78.69"/>

  <!-- feet and buckles -->
  <path class="high1" d="M68.15,389.94a19.36,19.36,0,0,0,19.36,19.35h0a15,15,0,0,0,15-15V379.94h20v43.7a5,5,0,0,1-5,5H68.62c-10.5,0-19.43-8.16-19.81-18.65A19.35,19.35,0,0,1,68.15,389.94Z"/>
  <path class="high2" d="M102.51,399.29H110a5,5,0,0,0,0-10h-7.51a5,5,0,1,0,0,10Z"/>
  <path class="high1" d="M191.85,389.94a19.36,19.36,0,0,1-19.36,19.35h0a15,15,0,0,1-15-15V379.94h-20v43.7a5,5,0,0,0,5,5h48.89c10.5,0,19.43-8.16,19.81-18.65A19.35,19.35,0,0,0,191.85,389.94Z"/>
  <path class="high2" d="M157.49,399.29H150a5,5,0,1,1,0-10h7.51a5,5,0,0,1,0,10Z"/>

</svg>
    `;
  }

}

customElements.define('maker-elf', MakerElfElement);