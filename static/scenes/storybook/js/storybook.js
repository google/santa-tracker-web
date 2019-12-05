import Nav from './ui/Nav.js'
import Slider from './ui/Slider.js'

import { CHAPTERS } from './model.js'

export default class Storybook {
  constructor(el) {
    this.el = el

    this.activeIndex = 0
    this.pages = CHAPTERS.length

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