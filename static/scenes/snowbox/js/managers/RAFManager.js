import createCustomEvent from '../utils/createCustomEvent.js'

class RAFManager {
  constructor() {
    this.handleRAF = this.handleRAF.bind(this)
    this.now = 0
  }

  init() {
    this.handleRAF(this.now)
  }

  handleRAF(now) {
    // time in ms
    this.now = now
    window.dispatchEvent(createCustomEvent('RAF', { now }))
    this.raf = window.requestAnimationFrame(this.handleRAF)
  }

  cancel() {
    window.cancelAnimationFrame(this.raf)
  }
}

export default new RAFManager()
