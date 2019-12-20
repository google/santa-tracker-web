import Nav from './ui/Nav.js'
import Slider from './ui/Slider.js'
import Sketch from './components/Sketch/Sketch.js'

import { CHAPTERS } from './model.js'

export default class Storybook {
  constructor(el, touchEnabled) {
    this.el = el;
    this.touchEnabled = touchEnabled;
    this.useGLCanvas = !this.touchEnabled();

    this.activeIndex = 0;
    this.pages = CHAPTERS.length;

    this.nav = this.el.querySelector('[data-nav]');
    this.slider = this.el.querySelector('[data-slider]');

    this.lullabyPlaying = false;
    this.musicSwitchPage = 19; // page on which to switch to lullaby music

    if (this.useGLCanvas) {
      Sketch.start();
    } else {
      this.el.classList.add('is-touch-device');
    }

    this.init();
  }

  init() {
    Nav.init(this.nav, this.activeIndex, this.pages, this.useGLCanvas);
    Slider.init(this.slider, this.activeIndex, this.pages, this.useGLCanvas);

    window.addEventListener('storybook_update', this.onUpdate.bind(this));
  }

  onUpdate(e) {
    let id = e.detail;
    if (id > this.musicSwitchPage && !this.lullabyPlaying) {
      window.santaApp.fire('sound-trigger', 'storybook_lullabye');
      this.lullabyPlaying = true;
    } else if (id < this.musicSwitchPage && this.lullabyPlaying){
      window.santaApp.fire('sound-trigger', 'storybook_start');
      window.santaApp.fire('sound-trigger', 'storybook_transition');
      this.lullabyPlaying = false;
    }
  }
}