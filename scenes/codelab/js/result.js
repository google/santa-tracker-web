goog.provide('app.Result');

/**
 * Level result display.
 * @param {Element} el dom element for this result.
 * @param {app.Game} game instance to handle user response.
 * @constructor
 */
app.Result = function(el, game) {
  this.el = el;
  this.game = game;

  this.detailsEl = el.querySelector('.result__details');
  this.graphicEl = el.querySelector('.result__graphic-type');
  this.missingBlockEl = el.querySelector('.result__missing-block');
  this.missingBlockImageEl = el.querySelector('.result__missing-block-image');
  this.retryButtonEl = el.querySelector('.result__button--retry');
  this.continueButtonEl = el.querySelector('.result__button--continue');
  this.continueText = this.continueButtonEl && this.continueButtonEl.textContent;
  this.finishText = app.I18n.getMsg('CL_finish');

  // Strangely, Safari doesn't like getAttributeNS. Hopefully this un-namespaced get
  // works in the rest.
  this.defaultGraphic = this.graphicEl.getAttribute('xlink:href');

  this.bindEvents_();
};

app.Result.prototype = {
  bindEvents_: function() {
    if (this.retryButtonEl) {
      this.retryButtonEl.addEventListener('click', this.onRetry.bind(this), false);
    }
    if (this.continueButtonEl) {
      this.continueButtonEl.addEventListener('click', this.onContinue.bind(this), false);
    }
  },

  /**
   * Shows the result screen for the specified level results.
   * @param {app.LevelResult} result
   */
  show: function(result) {
    this.detailsEl.style.display = result.message ? 'block' : 'none';
    this.detailsEl.textContent = result.message || '';

    if (this.retryButtonEl) {
      this.retryButtonEl.style.display = result.allowRetry ? 'inline-block' : 'none';
    }

    var missingBlock = result.missingBlocks[0];
    this.missingBlockEl.style.display = missingBlock ? 'block' : 'none';
    if (missingBlock) {
      this.missingBlockImageEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
          '#block-' + missingBlock);
    }

    this.graphicEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        result.graphic || this.defaultGraphic);

    if (this.continueButtonEl) {
       this.continueButtonEl.textContent =
          result.isFinalLevel ? this.finishText : this.continueText;
    }

    this.el.classList.add('is-visible');

    Klang.triggerEvent(result.levelComplete ? 'computer_success' : 'computer_fail');
  },

  hide: function() {
    this.el.classList.remove('is-visible');
  },

  onRetry: function() {
    this.hide();

    this.game.restartLevel();
  },

  onContinue: function() {
    this.hide();

    this.game.bumpLevel();
  }
};
