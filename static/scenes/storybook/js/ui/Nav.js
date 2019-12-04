import Scene from '../components/Scene.js'

export default class Nav {
  constructor(el) {
    this.el = el

    this.activeIndex = 0
    // TODO: USE CHAPTERS' LENGTH HERE
    this.pages = 10

    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)

    this.ui()
    this.event()
  }

  ui() {
    this.prevBtn = this.el.querySelector('[data-nav-prev]')
    this.nextBtn = this.el.querySelector('[data-nav-next]')
  }

  event() {
    this.prevBtn.addEventListener('click', this.prev)
    this.nextBtn.addEventListener('click', this.next)
  }

  prev() {
    this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.pages - 1
    Scene.update(this.activeIndex)
  }

  next() {
    this.activeIndex = this.activeIndex < this.pages - 1 ? this.activeIndex + 1 : 0
    Scene.update(this.activeIndex)
  }
}