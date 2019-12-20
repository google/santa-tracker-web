import TextManager from '../components/TextManager.js';
import Sketch from '../components/Sketch/Sketch.js';
import Nav from './Nav.js';
import Transition from '../components/Transition.js';
// console.log(Sketch)

class Slider {
  constructor() {
    this.handleSliderMouseUp = this.handleSliderMouseUp.bind(this);
    this.handleSliderProgress = this.handleSliderProgress.bind(this);
    this.update = this.update.bind(this);
  }

  init(el, index, length, useGLCanvas) {
    this.container = el;
    this.useGLCanvas = useGLCanvas;

    this.activeIndex = index;
    this.pages = length;

    this.render();
    this.event();
  }

  event() {
    this.slider.addEventListener('mousedown', () => {
      this.container.classList.add('is-grabbing');
    });

    this.slider.addEventListener('keydown', e => {
      if (this.slider === document.activeElement) {
        e.preventDefault();
      }
    });

    this.slider.addEventListener('mouseup', this.handleSliderMouseUp);
    this.slider.addEventListener('input', this.handleSliderProgress);
  }

  handleSliderMouseUp() {
    this.slider.blur();
    if(this.slider.value == this.activeIndex + 1) { return; }

    this.container.classList.remove('is-grabbing');
    Transition.trigger();
    TextManager.update(this.slider.value);
    if (this.useGLCanvas) {
      Sketch.updateChapter(this.slider.value - 1);
    }
    Nav.update(this.slider.value - 1);
    Nav.handleBtnVisibility();

    this.activeIndex = this.slider.value - 1;
  }

  handleSliderProgress() {
    this.slider.style.background = `linear-gradient(to right, #FFE14D 0%, #FFE14D ${this.slider.value / 22 * 100 - 1}%, #9FCEFF ${this.slider.value / 22 * 100 - 1}%, #9FCEFF 100%)`;
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
    this.activeIndex = this.slider.value - 1;
    this.handleSliderProgress();
  }
}

export default new Slider;