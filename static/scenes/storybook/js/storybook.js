import Nav from './ui/Nav.js'
import Slider from './ui/Slider.js'

import { CHAPTERS } from './model.js'

export default class Storybook {
  constructor(el) {
    this.el = el;

    this.activeIndex = 0;
    this.pages = CHAPTERS.length;

    this.nav = this.el.querySelector('[data-nav]');
    this.slider = this.el.querySelector('[data-slider]');

    this.lullabyPlaying = false;
    this.musicSwitchPage = 8; // page on which to switch to lullaby music

    this.init();
  }

  init() {
    Nav.init(this.nav, this.activeIndex, this.pages);
    Slider.init(this.slider, this.activeIndex, this.pages);

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