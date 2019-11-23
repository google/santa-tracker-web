import { RELEASE_BUTTON_TIME } from '../constants/index.js'
import SoundManager from '../managers/SoundManager.js'

const isClicked = {}

export default function pushButton(el, disable, callback, sound) {
	if (isClicked[el]) return
  el.classList.add('is-clicked')

  isClicked[el] = true

  if (sound) {
  	SoundManager.play('generic_button_click')
  }

  setTimeout(() => {
  	isClicked[el] = false
    el.classList.remove('is-clicked')
    if (disable) {
      el.classList.add('is-disabled')
    }
    if (callback) {
      callback()
    }
  }, RELEASE_BUTTON_TIME)
}