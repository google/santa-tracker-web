import Scene from '../components/Scene/index.js'
import SoundManager from '../managers/SoundManager.js'

export default class ObjectEditTool {
  constructor(el) {
    this.el = el

    this.ui = {
      rotateButtons: [...this.el.querySelectorAll('[data-rotate-object]')],
      colorButtons: [...this.el.querySelectorAll('[data-color-object]')],
      scaleButton: this.el.querySelector('[object-scale-slider]'),
      colorIconButton: this.el.querySelector('[data-open-colors]'),
      toolbar: this.el.querySelector('[object-toolbar-ui]'),
      rotateRight: this.el.querySelector('[object-rotate-right-ui]'),
      rotateBottom: this.el.querySelector('[object-rotate-bottom-ui]'),
      trash: this.el.querySelector('[object-trash-ui]'),
      trashButton: this.el.querySelector('[data-trash-object]'),
    }

    this.bind()
    this.hide()
    this.events()
  }

  bind() {
    this.updatePosition = this.updatePosition.bind(this)
    this.enterEditMode = this.enterEditMode.bind(this)
    this.hide = this.hide.bind(this)
    this.resetRotateButtons = this.resetRotateButtons.bind(this)
    this.onMouseDownRotate = this.onMouseDownRotate.bind(this)
    this.deleteObject = this.deleteObject.bind(this)
  }

  events() {
    this.ui.colorIconButton.addEventListener('click', this.onClickColorIcon)
    this.ui.scaleButton.addEventListener('input', Scene.onScaleInput)
    this.ui.trashButton.addEventListener('mousedown', this.deleteObject)

    this.ui.colorButtons.forEach(button => {
      button.addEventListener('click', Scene.colorObject)
    })

    this.ui.rotateButtons.forEach(button => {
      button.addEventListener('mousedown', this.onMouseDownRotate)
      button.addEventListener('mouseup', this.resetRotateButtons)
    })

    // custom events
    Scene.addListener('enter_edit', this.enterEditMode)
    Scene.addListener('leave_edit', this.hide)
    Scene.addListener('move_camera', this.updatePosition)
    Scene.addListener('scale_object', this.updatePosition)
  }

  enterEditMode() {
    if (!Scene.activeSubject) return false
    this.show()
    const { scaleFactor } = Scene.activeSubject // get current scale of object
    this.ui.scaleButton.value = scaleFactor * 10
    this.updatePosition()
  }

  show() {
    this.el.style.display = 'block'
    this.state = 'is-showed'
    if (!Scene.activeSubject.editable) {
      this.el.classList.add('not-editable')
    }
  }

  hide() {
    this.resetRotateButtons()
    this.ui.colorIconButton.classList.remove('is-open')
    this.el.style.display = 'none'
    this.state = 'is-hidden'
    this.el.classList.remove('not-editable')
  }

  updatePosition() {
    if (this.state === 'is-hidden') return

    if (Scene.activeSubject.editable) {
      const xArrowHelper = Scene.scene.getObjectByName( 'arrow-helper-x' ) // would be nice if we can store this value somewhere
      const xArrowHelperPos = Scene.getScreenPosition(xArrowHelper)
      this.ui.rotateRight.style.transform = `translate(-50%, -50%) translate(${xArrowHelperPos.x}px,${xArrowHelperPos.y}px)`

      const yArrowHelper = Scene.scene.getObjectByName( 'arrow-helper-y' )
      const yArrowHelperPos = Scene.getScreenPosition(yArrowHelper)
      this.ui.rotateBottom.style.transform = `translate(-50%, -50%) translate(${yArrowHelperPos.x}px,${yArrowHelperPos.y}px)`
    }

    const trashHelper = Scene.scene.getObjectByName( 'trash-helper' )
    const trashHelperPos = Scene.getScreenPosition(trashHelper)
    this.ui.trash.style.transform = `translate(-50%, -50%) translate(${trashHelperPos.x}px,${trashHelperPos.y}px)`

    const toolbarHelper = Scene.scene.getObjectByName( 'toolbar-helper' )
    const toolbarHelperPos = Scene.getScreenPosition(toolbarHelper)
    this.ui.toolbar.style.transform = `translate(-50%, -50%) translate(${toolbarHelperPos.x}px,${toolbarHelperPos.y}px)`
  }

  onClickColorIcon(e) {
    const el = e.currentTarget
    el.classList.toggle('is-open')
    if (el.classList.contains('is-open')) {
      SoundManager.play('snowbox_open_colors')
    }
  }

  onMouseDownRotate(e) {
    clearInterval(this.resetRotateInterval)

    const el = e.currentTarget
    Scene.rotateObject(el)

    el.classList.add('is-clicked')

    this.rotateInterval = setInterval(() => {
      Scene.rotateObject(el)
    }, 200)
  }

  resetRotateButtons() {
    clearInterval(this.rotateInterval)

    this.ui.rotateButtons.forEach(button => {
      this.resetRotateInterval = setTimeout(() => {
        button.classList.remove('is-clicked')
      }, 200)
    })
  }

  deleteObject(e) {
    const el = e.currentTarget
    el.classList.add('is-clicked')

    setTimeout(() => {
      SoundManager.play('snowbox_shape_delete')
      Scene.deleteObject()
      this.hide()
      el.classList.remove('is-clicked')
    }, 200)
  }
}

