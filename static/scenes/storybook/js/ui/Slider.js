import Scene from '../components/Scene.js'
import Nav from './Nav.js'

class Slider {
  constructor() {
    this.update = this.update.bind(this)
  }

  init(el, index, length) {
    this.container = el

    this.activeIndex = index
    this.pages = length

    this._render()
    this._event()
  }

  _event() {
    this.slider.addEventListener('mouseup', () => {
      Scene.update(this.slider.value)
      Nav.update(this.slider.value - 1)
    })
  }

  _render() {
    this.container.innerHTML =
    `
    <input data-slider type="range" min="1" max="${this.pages}" steps="1" value="${this.activeIndex}">
    `
    this.slider = this.container.querySelector('[data-slider]')
  }

  update(i) {
    this.slider.value = i
  }
}

export default new Slider