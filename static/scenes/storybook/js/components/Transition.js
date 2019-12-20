import '../../../../node_modules/lottie-web/build/player/lottie.js';
import Nav from '../ui/Nav.js';

class Transition {
  constructor() {
    this.container = document.querySelector('[data-transition-mask]');
    this.anims = [];
    this.MOBILE_SIZE = 768;
    this.IS_MOBILE = window.innerWidth < this.MOBILE_SIZE;

    this.handleResize = this.handleResize.bind(this);

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
      Object.assign(div.style, {
        height: "100%",
        position: "absolute",
        width: "100%",
      });

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
    if (window.innerWidth > 768 && this.IS_MOBILE) {
      this.IS_MOBILE = false;
    } else if(window.innerWidth < 768 && !this.IS_MOBILE) {
      this.IS_MOBILE = true;
    }
  }
}

export default new Transition;