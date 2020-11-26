/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {html, LitElement} from "lit-element";
import styles from './santa-orientation.css';
import {_msg} from '../magic.js';

class SantaOrientationElement extends LitElement {
  static get properties() {
    return {
      orientation: {type: String, reflect: true},
    };
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html`
<main>
  <svg xmlns="http://www.w3.org/2000/svg" width="392" height="380" viewBox="0 0 392 380"><path fill="none" stroke="#000" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M218.488 91.804c43.238 0 57.651 22.42 57.651 59.252"></path><path d="M253.895 150.292h44.857l-22.429 26.316z"></path><path fill="none" stroke="#000" stroke-width="5.546" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M18.075 46.4h143.274v257.554H18.075z"></path><path fill="none" stroke="#000" stroke-width="5.546" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M176.973 339.787c0 5.03-38.996 9.108-87.1 9.108s-87.1-4.078-87.1-9.108V11.881c0-5.031 38.996-9.109 87.1-9.109s87.1 4.078 87.1 9.109v327.906z"></path><path fill="none" stroke="#000" stroke-width="5.546" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M18.075 46.4h143.274v257.554H18.075z"></path><circle fill="none" stroke="#000" stroke-width="5.546" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="90.822" cy="24.405" r="4.554"></circle><path fill="#DCDDDE" d="M51.806 376.46c-5.03 0-9.108-38.996-9.108-87.101 0-48.104 4.078-87.1 9.108-87.1h327.905c5.031 0 9.109 38.996 9.109 87.1 0 48.104-4.078 87.101-9.109 87.101H51.806z"></path><path fill="none" stroke="#000" stroke-width="6.274" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M51.806 376.46c-5.03 0-9.108-38.996-9.108-87.101 0-48.104 4.078-87.1 9.108-87.1h327.905c5.031 0 9.109 38.996 9.109 87.1 0 48.104-4.078 87.101-9.109 87.101H51.806z"></path><path fill="none" stroke="#000" stroke-width="5.546" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M87.638 217.562h257.554v143.274H87.638z"></path><path fill="#FFE300" d="M87.638 217.562h257.554v143.274H87.638z"></path><path fill="none" stroke="#000" stroke-width="5.546" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M87.638 217.562h257.554v143.274H87.638z"></path><ellipse fill="none" stroke="#000" stroke-width="5.546" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="66.607" cy="286.514" rx="5.693" ry="21.633"></ellipse><circle fill="none" stroke="#000" stroke-width="5.546" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" cx="367.188" cy="290.31" r="4.554"></circle></svg>
  <p>${_msg`tilt`}</p>
</main>
    `;
  }
}

window.customElements.define('santa-orientation', SantaOrientationElement);
