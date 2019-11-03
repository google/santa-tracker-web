import SceneManager from '../components/SceneManager/index.js'

export default class ToolbarShapes {
  constructor(el) {
    this.el = el

    this.ui = {
      buttons: [...this.el.querySelectorAll('[data-add-shape]')],
      shareButton: this.el.querySelector('[data-share]'),
      screenshotImage: document.body.querySelector('[screenshot-image]')
    }

    this.onButtonMouseDown = this.onButtonMouseDown.bind(this)
    this.takeScreenshot = this.takeScreenshot.bind(this)

    this.events()
  }

  events() {
    this.ui.buttons.forEach(button => {
      button.addEventListener('mousedown', this.onButtonMouseDown)

      button.addEventListener('touchstart', this.onButtonMouseDown)
    })

    this.ui.shareButton.addEventListener('click', this.takeScreenshot)
  }

  onButtonMouseDown(e) {
    e.preventDefault()

    const button = e.currentTarget

    const mouseLeaveListener = () => {
      e.preventDefault()
      const { addShape, shapeMaterial } = button.dataset
      SceneManager.addShape(addShape, shapeMaterial)
      button.removeEventListener('mouseleave', mouseLeaveListener)
    }

    if (e.type === 'touchstart') {
      SceneManager.addingShape = button
    } else {
      button.addEventListener('mouseleave', mouseLeaveListener)
    }
  }

  takeScreenshot() {
    // https://stackoverflow.com/questions/9491417/when-webgl-decide-to-update-the-display
    SceneManager.renderer.render(SceneManager.scene, SceneManager.cameraCtrl.camera)
    const base64 = SceneManager.renderer.domElement.toDataURL()
    this.ui.screenshotImage.parentNode.classList.add('is-open')
    this.ui.screenshotImage.src = base64

    setTimeout(() => {
      this.ui.screenshotImage.parentNode.classList.remove('is-open')
    }, 2000)
  }
}

