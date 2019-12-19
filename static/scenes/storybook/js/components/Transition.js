import '../../../../node_modules/lottie-web/build/player/lottie.js';

class Transition {
  constructor() {
    this.container = document.querySelector('[data-transition-mask]');

    this.init();
  }

  init() {
    this.anim = lottie.loadAnimation({
      container: this.container,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: `img/transition.json`,
      rendererSettings: {
        preserveAspectRatio: 'none'
      },
    })

    this.anim.setSpeed(.6);
    this.anim.addEventListener('complete', () => {
      this.destroy();
    });
  }

  trigger() {
    this.container.classList.add('is-active');
    this.anim.goToAndPlay(0);
  }

  destroy() {
    this.container.classList.remove('is-active');
  }
}

export default new Transition;