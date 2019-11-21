import SoundManager from '../managers/SoundManager.js'
import { RELEASE_BUTTON_TIME } from '../constants/index.js'

export default class SoundButton {
  constructor(el) {
    this.el = el

    this.bind()
    this.events()
  }

  bind() {
    this.toogleSound = this.toogleSound.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
  }

  events() {
    this.el.addEventListener('mousedown', this.onMouseDown)
  }

  onMouseDown() {
    this.pushButton(this.el, this.toogleSound)
  }

  toogleSound() {
    console.log(SoundManager) // R.P: do something to turn on and off global sound
  }

  pushButton(el, callback) {
    el.classList.add('is-clicked')
    SoundManager.play('generic_button_click')
    setTimeout(() => {
      el.classList.remove('is-clicked')
      if (callback) {
        callback()
      }
    }, RELEASE_BUTTON_TIME)
  }
}
