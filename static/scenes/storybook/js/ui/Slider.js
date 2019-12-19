import Scene from '../components/Scene.js';
import Nav from './Nav.js';
import Transition from '../components/Transition.js';

class Slider {
  constructor() {
    this.handleSliderMouseUp = this.handleSliderMouseUp.bind(this);
    this.handleSliderProgress = this.handleSliderProgress.bind(this);
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
    this.slider.addEventListener('mouseup', this.handleSliderMouseUp)
    this.slider.addEventListener('input', this.handleSliderProgress)
  }

  handleSliderMouseUp() {
    Transition.trigger();
    Scene.update(this.slider.value);
    Nav.update(this.slider.value - 1);
    Nav.handleBtnVisibility();
  }

  handleSliderProgress() {
    this.slider.style.background = `linear-gradient(to right, #FFE14D 0%, #FFE14D ${this.slider.value / 22 * 100}%, #9FCEFF ${this.slider.value / 22 * 100}%, #9FCEFF 100%)`;
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
    this.handleSliderProgress()
  }
}

export default new Slider;