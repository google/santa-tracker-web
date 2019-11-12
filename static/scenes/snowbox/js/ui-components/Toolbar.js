import SceneManager from '../components/SceneManager/index.js'
import SoundManager from '../managers/SoundManager.js'

export default class Toolbar {
  constructor(el) {
    this.el = el

    this.ui = {
      buttons: [...this.el.querySelectorAll('[data-add-shape]')],
    }

    this.onButtonMouseDown = this.onButtonMouseDown.bind(this)

    this.events()
  }

  events() {
    this.ui.buttons.forEach(button => {
      button.addEventListener('mousedown', this.onButtonMouseDown)

      button.addEventListener('touchstart', this.onButtonMouseDown)
      button.addEventListener('mouseover', this.onButtonMouseOver)
      button.addEventListener('mouseout', this.onButtonMouseOut)
    })
  }

  onButtonMouseOver(e) {
    SoundManager.play('snowbox_shape_mouseover');
  }

  onButtonMouseOut(e) {
    SoundManager.play('snowbox_shape_mouseout');
  }

  onButtonMouseDown(e) {
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

