import SceneManager from '../components/SceneManager/index.js'

export default class CameraControls {
  constructor(el) {
    this.el = el

    this.ui = {
      zoomButtons: [...this.el.querySelectorAll('[data-zoom]')],
      rotateButtons: [...this.el.querySelectorAll('[data-rotate-camera]')]
    }

    this.events()
  }

  events() {
    this.ui.zoomButtons.forEach(button => {
      button.addEventListener('click', SceneManager.zoom)
    })

    this.ui.rotateButtons.forEach(button => {
      button.addEventListener('click', SceneManager.rotateCamera)
    })
  }
}

