goog.provide('app.Penguin');

goog.require('Constants');
goog.require('Utils');

goog.require('app.AnimationManager');
goog.require('app.Slider');
goog.require('app.shared.pools');

app.Penguin = class Penguin extends app.Slider {
  constructor(game) {
    super();

    document.getElementById('penguins').append(this.elem);
    this.elem.setAttribute('class', 'penguin');

    this.innerElem = document.createElement('div');
    this.innerElem.setAttribute('class', `penguin__inner`);
    this.elem.appendChild(this.innerElem);

    this.animations = {};

    const sides = ['front', 'back', 'side'];
    for (const side of sides) {
      app.AnimationManager.prepareAnimation(`img/penguin/${side}.json`, this.innerElem, side, (anim) => {
        this.animations[side] = anim;
      });
    }
  }

  onInit(config) {
    config.height = Constants.PENGUIN_HEIGHT;
    config.width = Constants.PENGUIN_WIDTH;

    super.onInit(config);

    this.animationFrame = Constants.PENGUIN_FRAMES.start;
    this.lastAnimationFrame = null;

    this.animationDirection = this.config.isVertical ? 'front' : 'side';
  }

  onDispose() {
    super.onDispose();

    if (this.animations['front']) {
      this.animations['front'].container.classList.remove('is-active');
    }

    if (this.animations['back']) {
      this.animations['back'].container.classList.remove('is-active');
    }

    if (this.animations['side']) {
      this.animations['side'].container.classList.remove('is-active');
    }

    this.innerElem.classList.remove('is-flipped');
  }

  onFrame(delta, now) {
    // update animationframe
    if (!this.lastAnimationFrame) {
      this.lastAnimationFrame = now;
    }

    const {
      nextFrame,
      frameTime
    } = Utils.nextAnimationFrame(Constants.PENGUIN_FRAMES,
        this.animationFrame, true, this.lastAnimationFrame, now);

    this.animationFrame = nextFrame;
    this.lastAnimationFrame = frameTime;

    super.onFrame();
  }

  render() {
    super.render();

    // handle direction change this frame
    if (this.flipped) {
      if (this.config.isVertical) {
        if (this.reversing) {
          this.animationDirection = 'back';
          if (this.animations['front']) {
            this.animations['front'].container.classList.remove('is-active');
          }
        } else {
          this.animationDirection = 'front';
          if (this.animations['back']) {
            this.animations['back'].container.classList.remove('is-active');
          }
        }
      } else {
        if (this.reversing) {
          this.innerElem.classList.add('is-flipped');
        } else {
          this.innerElem.classList.remove('is-flipped');
        }
      }
    }

    // render animation
    if (this.animations[this.animationDirection]) {
      this.animations[this.animationDirection].container.classList.add('is-active');
      this.animations[this.animationDirection].goToAndStop(this.animationFrame, true);
    }
  }

  onContact(player) {
    super.onContact(player);
    window.santaApp.fire('sound-trigger', 'buildandbolt_penguinbump');
    return [Constants.PLAYER_ACTIONS.RESTART];
  }
}

app.shared.pools.mixin(app.Penguin);
