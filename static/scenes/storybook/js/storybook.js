import Nav from './ui/Nav.js'
import Slider from './ui/Slider.js'

export default class Storybook {
  constructor(el) {
    this.el = el

    this.nav = this.el.querySelector('[data-nav]')
    this.slider = this.el.querySelector('[data-slider]')

    new Nav(this.nav)
    new Slider(this.slider)

    this.init()
  }

  init() {
    console.log('storybook init')
  }
}