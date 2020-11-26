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

import '../../../../node_modules/lottie-web/build/player/lottie.js';
import Nav from '../ui/Nav.js';

class Transition {
  constructor() {
    this.container = document.querySelector('[data-transition-mask]');
    this.anims = [];
    this.MOBILE_SIZE = 768;

    this.handleResize = this.handleResize.bind(this);

    this.handleResize();
    this.event();
    this.init();
  }

  event() {
    window.addEventListener('resize', this.handleResize);
  }

  init() {
    for (let i = 0; i < 2; i++) {
      const div = document.createElement('div');
      div.id = `storybook-transition-${i}`;
      div.className = 'transition-lottie-container';

      this.container.appendChild(div);

      let lottie_path = [
        'img/transition.json',
        'img/transition-mobile.json'
      ];

      const anim = lottie.loadAnimation({
        container: document.getElementById(`storybook-transition-${i}`),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: lottie_path[i],
        rendererSettings: {
          preserveAspectRatio: 'none'
        },
      });

      this.anims.push(anim);
    }

    this.anims.forEach(anim => {
      anim.setSpeed(.5);
      anim.addEventListener('complete', () => {
        this.destroy();
      });
    });
  }

  trigger() {
    this.container.classList.add('is-active');
    const anim = this.IS_MOBILE ? this.anims[1] : this.anims[0];
    anim.goToAndPlay(0);
  }

  destroy() {
    this.container.classList.remove('is-active');
    Nav.animating = false;
  }

  handleResize() {
    this.IS_MOBILE = window.innerWidth <= this.MOBILE_SIZE;
  }
}

export default new Transition;