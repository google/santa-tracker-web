import SceneManager from '../components/SceneManager/index.js'

export default class ToolbarShapes {
  constructor(el) {
    this.el = el

    this.ui = {
      buttons: [...this.el.querySelectorAll('[data-add-shape]')]
    }

    this.events()
  }

  events() {
    this.ui.buttons.forEach(button => {
      button.addEventListener('mousedown', e => {
        this.onButtonMouseDown(e, button)
      })

      button.addEventListener('touchstart', e => {
        this.onButtonMouseDown(e, button)
      })
    })
  }

  onButtonMouseDown(e, button) {
    e.preventDefault()

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
}

