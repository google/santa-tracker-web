import Scene from '../components/Scene.js';
import Slider from './Slider.js';
import Transition from '../components/Transition.js';

class Nav {
  constructor() {
    this.xDown = null;
    this.yDown = null;

    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  init(el, index, length) {
    this.el = el;
    this.prevBtn = this.el.querySelector('[data-nav-prev]');
    this.nextBtn = this.el.querySelector('[data-nav-next]');

    this.activeIndex = index;
    this.pages = length;

    this.event();
  }

  event() {
    this.prevBtn.addEventListener('click', this.prev);
    this.nextBtn.addEventListener('click', this.next);
    this.prevBtn.addEventListener('touchstart', this.prev);
    this.nextBtn.addEventListener('touchstart', this.next);
    document.addEventListener('touchstart', this.handleTouchStart, false);
    document.addEventListener('touchmove', this.handleTouchMove, false);
  }

  handleTouchStart(evt) {
    this.xDown = evt.touches[0].clientX;
    this.yDown = evt.touches[0].clientY;
  };

  handleTouchMove(evt) {
    if ( !this.xDown || !this.yDown ) { return; }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;
    const xDiff = this.xDown - xUp;
    const yDiff = this.yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
      xDiff > 0 ? this.next() : this.prev();
    }

    this.xDown = null;
    this.yDown = null;
  };

  prev() {
    this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.pages - 1;
    this.moveToChapter();
    this.handleBtnVisibility();
  }

  next() {
    this.activeIndex = this.activeIndex < this.pages - 1 ? this.activeIndex + 1 : 0;
    this.moveToChapter();
    this.handleBtnVisibility();
  }

  moveToChapter() {
    Transition.trigger();
    Scene.update(this.activeIndex + 1);
    Slider.update(this.activeIndex + 1);
    window.dispatchEvent(new CustomEvent('storybook_update', {detail: this.activeIndex + 1}));
  }

  handleBtnVisibility() {
    this.activeIndex == 0 ? this.prevBtn.classList.add('is-hidden') : this.prevBtn.classList.remove('is-hidden');
  }

  update(i) {
    this.activeIndex = i;
    window.dispatchEvent(new CustomEvent('storybook_update', {detail: this.activeIndex}));
  }
}

export default new Nav;