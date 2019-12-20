import TextManager from '../components/TextManager.js';
import Sketch from '../components/Sketch/Sketch.js'
import Slider from './Slider.js';
import Transition from '../components/Transition.js';

class Nav {
  constructor() {
    this.xDown = null;
    this.yDown = null;

    this.animating = false;

    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  init(el, index, length, useGLCanvas) {
    this.el = el;
    this.useGLCanvas = useGLCanvas;
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
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchmove', this.handleTouchMove);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleTouchStart(evt) {
    this.xDown = evt.touches[0].clientX;
    this.yDown = evt.touches[0].clientY;
  }

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
  }

  handleKeyDown(evt) {
    if (this.animating) { return; }

    if (evt.key == 'ArrowRight') {
      this.next();
    } else if(evt.key == 'ArrowLeft' && this.activeIndex !== 0) {
      this.prev();
    }
  }

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
    this.animating = true;
    Transition.trigger();
    TextManager.update(this.activeIndex + 1);
    if (this.useGLCanvas) {
      Sketch.updateChapter(this.activeIndex);
    }
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