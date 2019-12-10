goog.provide('app.AnimationManager');

// singleton to manage the game
class AnimationManager {
  constructor() {
    this.animations = {};
  }

  init(api, lottiePrepareAnimation) {
    // we have to do that because we can't mix an `import api from '../../src/scene/api.js'` and goog.provide()
    this.api = api;
    this.lottiePrepareAnimation = lottiePrepareAnimation;
  }

  prepareAnimation(path, container, side, callback, apiPreload) {
    const p = this.lottiePrepareAnimation(path, {
      container,
      loop: false,
      autoplay: false,
      rendererSettings: {
        className: `animation animation--${side}`
      },
    }).then((anim) => {
      callback(anim)
    });

    if (apiPreload) {
      this.api.preload.wait(p);
    }
  }
}

app.AnimationManager = new AnimationManager();
