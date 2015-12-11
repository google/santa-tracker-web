/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict';

goog.provide('app.Result');

/**
 * Level result display.
 * @param {Element} el dom element for this result.
 * @param {!app.Game} game instance to handle user response.
 * @constructor
 */
app.Result = class {
  constructor(el, game) {
    this.el = el;
    this.game = game;

    this.codeEl = el.querySelector('.result__code');
    this.detailsEl = el.querySelector('.result__details');
    this.graphicEl = el.querySelector('.result__graphic-type');
    this.missingBlockEl = el.querySelector('.result__missing-block');
    this.missingBlockImageEl = el.querySelector('.result__missing-block-image');
    this.shareButtonEl = el.querySelector('.result__button--share');
    this.retryButtonEl = el.querySelector('.result__button--retry');
    this.codeLinkEl = el.querySelector('.result__code-link');
    this.continueButtonEl = el.querySelector('.result__button--continue');
    this.continueText = this.continueButtonEl && this.continueButtonEl.textContent;
    this.finishText = app.I18n.getMsg('CB_finish');
    this.shareUrl = null;

    // Strangely, Safari doesn't like getAttributeNS. Hopefully this un-namespaced get
    // works in the rest.
    this.defaultGraphic = this.graphicEl.getAttribute('xlink:href');

    this.bindEvents_();
  }

  bindEvents_() {
    if (this.retryButtonEl) {
      this.retryButtonEl.addEventListener('click', this.onRetry.bind(this), false);
    }
    if (this.shareButtonEl) {
      this.shareButtonEl.addEventListener('click', this.onShare.bind(this), false);
    }
    if (this.continueButtonEl) {
      this.continueButtonEl.addEventListener('click', this.onContinue.bind(this), false);
    }
    if (this.codeLinkEl) {
      this.codeLinkEl.addEventListener('click', this.onShowCode.bind(this), false);
    }
  }

  /**
   * Shows the result screen for the specified level results.
   * @param {app.LevelResult} result
   */
  show(result) {
    this.detailsEl.style.display = result.message ? 'block' : 'none';
    this.detailsEl.textContent = result.message || '';

    if (this.retryButtonEl) {
      this.retryButtonEl.style.display = result.allowRetry ? 'inline-block' : 'none';
    }

    if (this.shareButtonEl) {
      this.shareButtonEl.style.display = result.shareUrl ? 'inline-block' : 'none';
      this.shareUrl = result.shareUrl;
    }

    var missingBlock = result.missingBlocks[0];
    this.missingBlockEl.style.display = missingBlock ? 'block' : 'none';
    if (missingBlock) {
      this.missingBlockImageEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
          '#block-' + missingBlock);
    }

    this.graphicEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        result.overlayGraphic || this.defaultGraphic);

    if (this.continueButtonEl) {
       this.continueButtonEl.textContent =
          result.isFinalLevel ? this.finishText : this.continueText;
    }

    if (this.codeEl) {
      this.codeLinkEl.hidden = !result.code;
      this.codeEl.value = result.code || '';
    }

    this.el.classList.remove('result--show-code');
    this.el.classList.add('is-visible');
  }

  hide() {
    this.el.classList.remove('is-visible');
  }

  onRetry() {
    this.hide();

    this.game.restartLevel();
  }

  onShare() {
    this.game.share(this.shareUrl);
  }

  onContinue() {
    this.hide();

    this.game.bumpLevel();
  }

  onShowCode() {
    this.el.classList.add('result--show-code');
  }
};
