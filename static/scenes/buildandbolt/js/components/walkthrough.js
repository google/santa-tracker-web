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

goog.provide('app.Walkthrough');

goog.require('Constants');

goog.require('app.LevelManager');

class Walkthrough {
  init(game, elem) {
    this.elem = elem;
    this.game = game;

    this.dom = {
      text: this.elem.querySelector('[data-walkthrough-text]'),
      toys: this.elem.querySelector('[data-walkthrough-toys]')
    };
  }

  show() {
    this.elem.classList.remove('is-hidden');
  }

  hide() {
    this.elem.classList.add('is-hidden');
  }

  updateLevel() {
    const { toyType, toysCapacity } = app.LevelManager;
    // update text
    this.dom.text.innerHTML = this.getMessage(toyType, toysCapacity);

    // update toys
    this.dom.toys.innerHTML = '';

    for (let i = 0; i < toyType.size; i++) {
      const domToypart = document.createElement('div');
      domToypart.classList.add('walkthrough__toypart');
      domToypart.classList.add('walkthrough__appear');

      const img = document.createElement('img');
      img.classList.add('walkthrough__toypart-img');
      img.src = `img/toys/${toyType.key}/${i + 1}.svg`;

      const domOperator = document.createElement('div');
      domOperator.classList.add('walkthrough__operator');
      domOperator.classList.add('walkthrough__appear');
      domOperator.innerHTML = i === toyType.size - 1 ? '=' : '+';

      domToypart.appendChild(img);

      this.dom.toys.appendChild(domToypart);
      this.dom.toys.appendChild(domOperator);
    }

    const domToyfull = document.createElement('div');
    domToyfull.classList.add('walkthrough__toyfull');
    domToyfull.classList.add('walkthrough__appear');

    const img = document.createElement('img');
    img.classList.add('walkthrough__toyfull-img');
    img.src = `img/toys/${toyType.key}/full.svg`;

    domToyfull.appendChild(img);

    this.dom.toys.appendChild(domToyfull);
  }

  getMessage(toyType, toysCapacity) {
    let message = '';

    if (toysCapacity > 1) {
      const msgId = `${toyType.key}-multiple`;
      const messageRaw = this.game.msg[msgId];
      message = messageRaw.replace('{{count}}', `<span class="walkthrough__number">${toysCapacity}</span>`);
    } else {
      const msgId = `${toyType.key}-single`;
      const messageRaw = this.game.msg[msgId];
      message = messageRaw.replace('1', `<span class="walkthrough__number">${toysCapacity}</span>`);
    }

    return message;
  }
}

app.Walkthrough = new Walkthrough();