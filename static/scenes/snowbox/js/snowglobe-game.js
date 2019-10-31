import SceneManager from './components/SceneManager/index.js'
import { EventEmitter } from './event-emitter.js'

const { Scene, PerspectiveCamera } = self.THREE

class SnowglobeGame {
  static get is() {
    return 'snowglobe-game'
  }

  constructor(element) {
    this.canvas = element.querySelector('#canvas')
    this.openColorsBtn = element.querySelector('[data-open-colors]')
    this.colorObjectBtns = [...element.querySelectorAll('[data-color-object]')]
    this.addShapeBtns = [...element.querySelectorAll('[data-add-shape]')]
    this.rotateObjectBtns = [...element.querySelectorAll('[data-rotate-object]')]
    this.rotateCameraBtns = [...element.querySelectorAll('[data-rotate-camera]')]
    this.zoomBtns = [...element.querySelectorAll('[data-zoom]')]
    this.objectRotateBottomUi = element.querySelector('[object-rotate-bottom-ui]')
    this.objectRotateRightUi = element.querySelector('[object-rotate-right-ui]')
    this.objectToolbarUi = element.querySelector('[object-toolbar-ui]')
    this.objectScaleSlider = element.querySelector('[object-scale-slider]')
    this.sceneManager = new SceneManager(this.canvas)

    this.updateEditToolsPos = this.updateEditToolsPos.bind(this)
    this.enterEditMode = this.enterEditMode.bind(this)
    this.hideEditTools = this.hideEditTools.bind(this)

    this.stats = new self.Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom)

    this.hideEditTools()
    this.events()
    this.render()
  }

  events() {
    // global UI
    this.zoomBtns.forEach(button => {
      button.addEventListener('click', this.sceneManager.zoom)
    })

    this.rotateCameraBtns.forEach(button => {
      button.addEventListener('click', this.sceneManager.rotateCamera)
    })

    this.addShapeBtns.forEach(button => {
      const mouseleaveCallback = e => {
        e.preventDefault()
        const { addShape, shapeMaterial } = button.dataset
        this.sceneManager.addShape(addShape, shapeMaterial)
        button.removeEventListener('mouseleave', mouseleaveCallback, false)
      }

      button.addEventListener('mousedown', e => {
        e.preventDefault()
        button.addEventListener('mouseleave', mouseleaveCallback)
      })
    })

    // object UI
    this.colorObjectBtns.forEach(button => {
      button.addEventListener('click', this.sceneManager.colorObject)
    })

    this.openColorsBtn.addEventListener('click', this.openColors)
    this.objectScaleSlider.addEventListener('input', this.sceneManager.onScaleInput)

    let rotateObjectInterval

    this.rotateObjectBtns.forEach(button => {
      button.addEventListener('click', e => {
        const el = e.currentTarget
        this.sceneManager.rotateObject(el)
        button.classList.add('is-clicked')
      })

      button.addEventListener('mousedown', e => {
        e.preventDefault()
        const el = e.currentTarget
        rotateObjectInterval = setInterval(() => {
          this.sceneManager.rotateObject(el)
          button.classList.add('is-clicked')
        }, 200)
      })

      button.addEventListener('mouseup', e => {
        e.preventDefault()
        clearInterval(rotateObjectInterval)
        setTimeout(() => {
          button.classList.remove('is-clicked')
        }, 200)
      })
    })

    // custom events
    this.sceneManager.addListener('enter_edit', this.enterEditMode)
    this.sceneManager.addListener('leave_edit', this.hideEditTools)
    this.sceneManager.addListener('move_camera', this.updateEditToolsPos)
    this.sceneManager.addListener('scale_object', this.updateEditToolsPos)
  }

  enterEditMode() {
    this.showEditTools()
    const { scaleFactor } = this.sceneManager.activeSubject // get current scale of object
    this.objectScaleSlider.value = scaleFactor * 10
    this.updateEditToolsPos()
  }

  showEditTools() {
    this.objectRotateRightUi.style.display = 'block'
    this.objectRotateBottomUi.style.display = 'block'
    this.objectToolbarUi.style.display = 'block'
  }

  hideEditTools() {
    this.objectRotateRightUi.style.display = 'none'
    this.objectRotateBottomUi.style.display = 'none'
    this.objectToolbarUi.style.display = 'none'
  }

  updateEditToolsPos() {
    const xArrowHelper = this.sceneManager.scene.getObjectByName( 'arrow-helper-x' ) // would be nice if we can store this value somewhere
    const xArrowHelperPos = this.sceneManager.getScreenPosition(xArrowHelper)
    this.objectRotateRightUi.style.transform = `translate(-50%, -50%) translate(${xArrowHelperPos.x}px,${xArrowHelperPos.y}px)`

    const yArrowHelper = this.sceneManager.scene.getObjectByName( 'arrow-helper-y' )
    const yArrowHelperPos = this.sceneManager.getScreenPosition(yArrowHelper)
    this.objectRotateBottomUi.style.transform = `translate(-50%, -50%) translate(${yArrowHelperPos.x}px,${yArrowHelperPos.y}px)`

    const toolbarHelper = this.sceneManager.scene.getObjectByName( 'toolbar-helper' )
    const toolbarHelperPos = this.sceneManager.getScreenPosition(toolbarHelper)
    this.objectToolbarUi.style.transform = `translate(-50%, -50%) translate(${toolbarHelperPos.x}px,${toolbarHelperPos.y}px)`
  }

  openColors(e) {
    const el = e.currentTarget
    el.classList.toggle('is-open')
  }

  render(now) {
    this.stats.begin()
    this.sceneManager.update(now)
    this.stats.end()

    requestAnimationFrame(this.render.bind(this))
  }

  setup() {}

  update() {}

  teardown() {}

  start() {}
  resume() {}
}

customElements.define(SnowglobeGame.is, SnowglobeGame)

export default SnowglobeGame
