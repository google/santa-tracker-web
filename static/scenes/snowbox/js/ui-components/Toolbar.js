import Scene from '../components/Scene/index.js'
import SoundManager from '../managers/SoundManager.js'

export default class Toolbar {
  constructor(el) {
    this.el = el

    this.ui = {
      items: [...this.el.querySelectorAll('[data-toolbar-shape]')],
      arrows: [...this.el.querySelectorAll('[data-toolbar-arrow]')],
      slider: this.el.querySelector('.toolbar__slider')
    }

    this.currentIndex = 0
    this.x = 0

    this.onArrowDown = this.onArrowDown.bind(this)
    this.setUnits = this.setUnits.bind(this)
    this.setUnits()

    this.events()
  }

  events() {
    window.addEventListener('resize', this.setUnits)

    this.ui.arrows.forEach(arrow => {
      arrow.addEventListener('mousedown', this.onArrowDown)
      arrow.addEventListener('mouseenter', this.onArrowOver)
    })

    this.ui.items.forEach(item => {
      item.addEventListener('mousedown', this.onMouseDown)

      item.addEventListener('touchstart', this.onMouseDown)
      item.addEventListener('mouseenter', this.onMouseOver)
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

  onArrowOver(e) {
    SoundManager.play('snowbox_generic_hover');
  }

  onArrowDown(e) {
    if (this.offsetXSlider > 0) return

    const el = e.currentTarget
    this.pushButton(el)
    const { toolbarArrow } = el.dataset
    let index = this.currentIndex
    let direction = 1

    if (toolbarArrow === 'left') {
      direction = -1
      index -= 1
    }

    if (index < 0 || index === this.ui.items.length - 1 || this.x < this.offsetXSlider - this.ui.items[this.ui.items.length - 1].offsetWidth && direction === 1) return

    this.x += this.ui.items[index].offsetWidth * -direction

    this.currentIndex += direction

    this.ui.items.forEach(item => {
      if (item.classList.contains('no-transition')) {
        item.classList.remove('no-transition')
      }
      item.style.transform = `translateX(${this.x}px)`
    })

    SoundManager.play('generic_button_click');
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

  setUnits() {
    this.x = 0
    this.currentIndex = 0
    this.totalItemsWidth = 0
    for (let i = 0; i < this.ui.items.length; i++) {
      this.totalItemsWidth += this.ui.items[i].offsetWidth
      this.ui.items[i].classList.add('no-transition')
      this.ui.items[i].style.transform = 'none'
    }

    this.sliderWidth = this.ui.slider.offsetWidth
    this.offsetXSlider = this.sliderWidth - this.totalItemsWidth
    if (this.offsetXSlider > 0) {
      this.el.classList.add('no-arrow')
    } else {
      this.el.classList.remove('no-arrow')
    }
  }
}

