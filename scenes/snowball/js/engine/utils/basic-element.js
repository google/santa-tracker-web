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

const {
  ShadyCSS
} = self;

const preparedTemplates = new Set();

export class BasicElement extends HTMLElement {
  static get is() { return null; }

  static get template() {
    return null;
  }

  static prepareTemplate() {
    if (preparedTemplates.has(this)) {
      return;
    }

    const { template, is } = this;

    if (ShadyCSS != null && is != null && template != null) {
      ShadyCSS.prepareTemplate(template, is);
    }

    preparedTemplates.add(this);
  }

  stampTemplate() {
    this.attachShadow({ mode: 'open' });
    this.constructor.prepareTemplate();

    const template = this.constructor.template;

    if (template != null) {
      this.shadowRoot.appendChild(
          document.importNode(template.content, true));
    }
  }
};
