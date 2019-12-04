import Nav from './ui/Nav.js'
import Slider from './ui/Slider.js'

export default class Storybook {
  constructor(el) {
    this.el = el

    this.activeIndex = 0
    // TODO: USE ACTUAL PAGES LENGTH HERE
    this.pages = 10

    this.nav = this.el.querySelector('[data-nav]')
    this.slider = this.el.querySelector('[data-slider]')

    Nav.init(this.nav, this.activeIndex, this.pages)
    Slider.init(this.slider, this.activeIndex, this.pages)

    this.init()
  }

  init() {
    console.log('storybook init')
  }
}