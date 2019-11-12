import SceneManager from '../components/SceneManager/index.js'
import SoundManager from '../managers/SoundManager.js'

export default class Toolbar {
  constructor(el) {
    this.el = el

    this.ui = {
      buttons: [...this.el.querySelectorAll('[data-add-shape]')],
    }

    this.events()
  }

  events() {
    this.ui.buttons.forEach(button => {
      button.addEventListener('mousedown', this.onMouseDown)

      button.addEventListener('touchstart', this.onMouseDown)
      button.addEventListener('mouseover', this.onMouseOver)
      button.addEventListener('mouseout', this.onMouseOut)
    })
  }

  onMouseOver(e) {
    SoundManager.play('snowbox_shape_mouseover');
  }

  onMouseOut(e) {
    SoundManager.play('snowbox_shape_mouseout');
  }

  onMouseDown(e) {
    e.preventDefault()

    const button = e.currentTarget
    SoundManager.play('snowbox_toolbox_select');

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

