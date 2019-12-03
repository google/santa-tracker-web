import Scene from '../components/Scene.js'

export default class Nav {
  constructor(el) {
    this.el = el
    this.ui()
    this.event()
  }

  ui() {
    this.prevBtn = this.el.querySelector('[data-nav-prev]')
    this.nextBtn = this.el.querySelector('[data-nav-next]')
  }

  event() {
    this.prevBtn.addEventListener('click', Scene.prev)
    this.nextBtn.addEventListener('click', Scene.next)
  }
}