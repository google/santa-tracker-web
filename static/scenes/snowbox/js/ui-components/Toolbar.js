import Scene from '../components/Scene/index.js'
import SoundManager from '../managers/SoundManager.js'

export default class Toolbar {
  constructor(el) {
    this.el = el

    this.ui = {
      items: [...this.el.querySelectorAll('[data-toolbar-shape]')],
      arrows: [...this.el.querySelectorAll('[data-toolbar-arrow]')],
    }

    this.currentIndex = 0
    this.x = 0

    this.onArrowDown = this.onArrowDown.bind(this)

    this.events()
  }

  events() {
    this.ui.arrows.forEach(arrow => {
      arrow.addEventListener('mousedown', this.onArrowDown)
    })

    this.ui.items.forEach(item => {
      item.addEventListener('mousedown', this.onMouseDown)

      item.addEventListener('touchstart', this.onMouseDown)
      item.addEventListener('mouseover', this.onMouseOver)
      item.addEventListener('mouseout', this.onMouseOut)
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
      const { toolbarShape, shapeMaterial } = button.dataset
      Scene.addShape(toolbarShape, shapeMaterial)
      button.removeEventListener('mouseleave', mouseLeaveListener)
    }

    if (e.type === 'touchstart') {
      Scene.addingShape = button
    } else {
      button.addEventListener('mouseleave', mouseLeaveListener)
    }
  }

  onArrowDown(e) {
    const el = e.currentTarget
    this.pushButton(el)
    const { toolbarArrow } = el.dataset
    let index = this.currentIndex
    let direction = 1

    if (toolbarArrow === 'left') {
      direction = -1
      index -= 1
    }

    if (index < 0 || index === this.ui.items.length - 1 ) return

    this.x += this.ui.items[index].offsetWidth * -direction

    this.currentIndex += direction

    this.ui.items.forEach(item => {
      item.style.transform = `translateX(${this.x}px)`
    })
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

