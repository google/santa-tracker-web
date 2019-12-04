import Scene from '../components/Scene.js'
import Slider from './Slider.js'

class Nav {
  constructor() {
    this._prev = this._prev.bind(this)
    this._next = this._next.bind(this)
  }

  init(el, index, length) {
    this.el = el
    this.prevBtn = this.el.querySelector('[data-nav-prev]')
    this.nextBtn = this.el.querySelector('[data-nav-next]')

    this.activeIndex = index
    this.pages = length

    this._event()
  }

  _event() {
    this.prevBtn.addEventListener('click', this._prev)
    this.nextBtn.addEventListener('click', this._next)
  }

  _prev() {
    this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.pages - 1
    Scene.update(this.activeIndex + 1)
    Slider.update(this.activeIndex + 1)
  }

  _next() {
    this.activeIndex = this.activeIndex < this.pages - 1 ? this.activeIndex + 1 : 0
    Scene.update(this.activeIndex + 1)
    Slider.update(this.activeIndex + 1)
  }

  update(i) {
    this.activeIndex = i
  }
}

export default new Nav