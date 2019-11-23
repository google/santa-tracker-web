import SoundManager from '../managers/SoundManager.js'
import { RELEASE_BUTTON_TIME } from '../constants/index.js'
import pushButton from '../utils/pushButton.js'

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
    pushButton(this.el, null, this.toogleSound, true)
  }

  toogleSound() {
    console.log(SoundManager) // R.P: do something to turn on and off global sound
  }
}
