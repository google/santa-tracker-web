import SceneManager from '../components/SceneManager/index.js'

export default class ToolbarShapes {
  constructor(el) {
    this.el = el

    this.ui = {
      buttons: [...this.el.querySelectorAll('[data-add-shape]')],
      screenshot: this.el.querySelector('[data-share]')
    }

    this.onButtonMouseDown = this.onButtonMouseDown.bind(this)

    this.events()
  }

  events() {
    this.ui.buttons.forEach(button => {
      button.addEventListener('mousedown', this.onButtonMouseDown)

      button.addEventListener('touchstart', this.onButtonMouseDown)
    })

    this.ui.screenshot.addEventListener('click', this.takeScreenshot)
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
    const img = new Image()
    img.src = base64

    document.body.appendChild(img)
  }
}

