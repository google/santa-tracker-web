import Scene from '../components/Scene.js';
import Nav from './Nav.js';
import Transition from '../components/Transition.js';

class Slider {
  constructor() {
    this.update = this.update.bind(this);
  }

  init(el, index, length) {
    this.container = el;

    this.activeIndex = index;
    this.pages = length;

    this.render();
    this.event();
  }

  event() {
    this.slider.addEventListener('mousedown', () => {
      this.container.classList.add('is-grabbing');
    });
    this.slider.addEventListener('mouseup', () => {
      this.container.classList.remove('is-grabbing');
      Transition.trigger();
      Scene.update(this.slider.value);
      Nav.update(this.slider.value - 1);
      Nav.handleBtnVisibility();
    })
  }

  render() {
    this.container.innerHTML =
    `
    <input data-slider type="range" min="1" max="${this.pages}" steps="1" value="${this.activeIndex}">
    `
    this.slider = this.container.querySelector('[data-slider]');
  }

  update(i) {
    this.slider.value = i;
  }
}

export default new Slider;