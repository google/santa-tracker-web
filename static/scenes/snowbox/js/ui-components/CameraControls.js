import CameraController from '../components/CameraController/index.js'

export default class CameraControls {
  constructor(el) {
    this.el = el

    this.ui = {
      zoomButtons: [...this.el.querySelectorAll('[data-zoom]')],
      rotateButtons: [...this.el.querySelectorAll('[data-rotate-camera]')]
    }

    this.zoom = this.zoom.bind(this)
    this.rotateCamera = this.rotateCamera.bind(this)

    this.events()
  }

  events() {
    this.ui.zoomButtons.forEach(button => {
      button.addEventListener('click', this.zoom)
    })

    this.ui.rotateButtons.forEach(button => {
      button.addEventListener('click', this.rotateCamera)
    })
  }

  zoom(e) {
    const el = e.currentTarget
    CameraController.zoom(el.dataset.zoom, el)

    // edit btn class
    this.ui.zoomButtons.forEach(button => {
      if (button.classList.contains('is-disabled') && button !== el) button.classList.remove('is-disabled')
    })
    const { currentZoom, zoomSteps } = CameraController
    const disable = currentZoom <= 0 || currentZoom + 1 >= zoomSteps.length
    // if last zoom, disable
    this.pushButton(el, disable)
  }

  rotateCamera(e) {
    const el = e.currentTarget
    const { rotateCamera } = el.dataset
    CameraController.rotate(rotateCamera)
    // edit btn class
    let disable = false
    if (rotateCamera === 'top' || rotateCamera === 'bottom') {
      this.ui.rotateButtons.forEach(button => {
        if (button.classList.contains('is-disabled') && button !== el) button.classList.remove('is-disabled')
      })
      const { rotationXZ, targetAngle, rotateXZMin, rotateXZMax } = CameraController
      disable = rotationXZ + targetAngle >= rotateXZMin || rotationXZ + targetAngle <= rotateXZMax
    }

    this.pushButton(el, disable)
  }

  pushButton(el, disable = false) {
    el.classList.add('is-clicked')
    setTimeout(() => {
      el.classList.remove('is-clicked')
      if (disable) {
        el.classList.add('is-disabled')
      }
    }, 200)
  }
}

