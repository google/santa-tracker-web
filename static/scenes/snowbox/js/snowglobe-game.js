import SceneManager from './components/SceneManager/index.js'

const { Scene, PerspectiveCamera } = self.THREE

class SnowglobeGame {
  static get is() {
    return 'snowglobe-game'
  }

  constructor(element) {
    this.canvas = element.querySelector('#canvas')
    this.actionBtns = [...element.querySelectorAll('[data-button]')]
    this.actionDragBtns = [...element.querySelectorAll('[data-button-drag]')]
    this.rotateBtns = [...element.querySelectorAll('[data-rotate-button]')]
    this.objectRotateBottomUi = element.querySelector('[object-rotate-bottom-ui]')
    this.objectRotateRightUi = element.querySelector('[object-rotate-right-ui]')
    this.objectToolbarUi = element.querySelector('[object-toolbar-ui]')
    this.objectScaleSlider = element.querySelector('[object-scale-slider]')
    this.sceneManager = new SceneManager(this.canvas)

    this.objectRotateRightUi.style.display = `none`
    this.objectRotateBottomUi.style.display = 'none'
    this.objectToolbarUi.style.display = `none`

    this.stats = new self.Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom)

    const render = now => {}

    this.bindEventListeners()
    this.render()
  }

  bindEventListeners() {
    window.addEventListener('resize', () => {
      this.sceneManager.onWindowResize()
    })

    document.addEventListener('keydown', e => {
      this.sceneManager.onKeydown(e)
    })

    this.canvas.addEventListener(
      'mousemove',
      e => {
        e.preventDefault()
        if (this.sceneManager.mouseState === 'down' && this.sceneManager.mode === '') {
          this.sceneManager.setMode('drag')
        }
        this.sceneManager.onMouseMove(e)
      },
      false
    )

    this.canvas.addEventListener(
      'mousedown',
      e => {
        e.preventDefault()
        this.sceneManager.onMouseDown(e)
      },
      false
    )

    this.canvas.addEventListener(
      'mouseup',
      e => {
        e.preventDefault()
        this.sceneManager.onMouseUp()
        if (this.sceneManager.mode !== 'move' && this.sceneManager.mode !== 'edit') {
          this.sceneManager.setMode()
        }
      },
      false
    )

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault()
      this.sceneManager.onWheel(e)
    })

    this.actionBtns.forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault()
        this.sceneManager.onButtonClick(button.dataset.button, e.currentTarget)
        button.classList.add('is-clicked')
        setTimeout(() => {
          button.classList.remove('is-clicked')
        }, 200)
      })
    })

    this.actionDragBtns.forEach(button => {
      const mouseleaveCallback = e => {
        e.preventDefault()
        this.sceneManager.onButtonClick(button.dataset.buttonDrag)
        button.removeEventListener('mouseleave', mouseleaveCallback, false)
      }

      button.addEventListener('mousedown', e => {
        e.preventDefault()
        button.addEventListener('mouseleave', mouseleaveCallback)
        button.classList.add('is-clicked')
        setTimeout(() => {
          button.classList.remove('is-clicked')
        }, 200)
      })
    })

    let rotateInterval

    this.rotateBtns.forEach(button => {
      button.addEventListener('click', e => {
        this.sceneManager.onButtonClick(button.dataset.rotateButton)
        button.classList.add('is-clicked')
      })

      button.addEventListener('mousedown', e => {
        e.preventDefault()
        rotateInterval = setInterval(() => {
          this.sceneManager.onButtonClick(button.dataset.rotateButton)
          button.classList.add('is-clicked')
        }, 200)
      })

      button.addEventListener('mouseup', e => {
        e.preventDefault()
        clearInterval(rotateInterval)
        setTimeout(() => {
          button.classList.remove('is-clicked')
        }, 200)
      })
    })

    this.objectScaleSlider.addEventListener('input', e => {
      this.sceneManager.onScaleInput(e)
    })

    this.sceneManager.addListener('enter_edit', () => {
      if (this.sceneManager.activeSubject && this.sceneManager.mode === 'edit') {
        this.objectRotateBottomUi.style.display = `block`
        this.objectToolbarUi.style.display = `block`
        this.objectRotateRightUi.style.display = `block`
        const { scaleFactor } = this.sceneManager.activeSubject // get current scale of object
        this.objectScaleSlider.value = scaleFactor * 10
        updateEditToolsPos()
      }
    })

    this.sceneManager.addListener('move_camera', e => {
      if (this.sceneManager.activeSubject && this.sceneManager.mode === 'edit') {
        updateEditToolsPos()
      }
    })

    this.sceneManager.addListener('scale_object', e => {
      if (this.sceneManager.activeSubject && this.sceneManager.mode === 'edit') {
        updateEditToolsPos(true)
      }
    })

    this.sceneManager.addListener('leave_edit', () => {
      this.objectRotateRightUi.style.display = 'none'
      this.objectRotateBottomUi.style.display = 'none'
      this.objectToolbarUi.style.display = 'none'
    })

    const updateEditToolsPos = noScaleInput => {
      const xArrowHelper = this.sceneManager.scene.getObjectByName( 'arrow-helper-x' ) // would be nice if we can store this value somewhere
      const xArrowHelperPos = getScreenPosition(xArrowHelper)
      this.objectRotateRightUi.style.transform = `translate(-50%, -50%) translate(${xArrowHelperPos.x}px,${xArrowHelperPos.y}px)`

      const yArrowHelper = this.sceneManager.scene.getObjectByName( 'arrow-helper-y' )
      const yArrowHelperPos = getScreenPosition(yArrowHelper)
      this.objectRotateBottomUi.style.transform = `translate(-50%, -50%) translate(${yArrowHelperPos.x}px,${yArrowHelperPos.y}px)`

      const toolbarHelper = this.sceneManager.scene.getObjectByName( 'toolbar-helper' )
      const toolbarHelperPos = getScreenPosition(toolbarHelper)
      this.objectToolbarUi.style.transform = `translate(-50%, -50%) translate(${toolbarHelperPos.x}px,${toolbarHelperPos.y}px)`
    }

    const getScreenPosition = obj => {
      const { width, height, cameraCtrl: { camera } } = this.sceneManager
      const vector = new THREE.Vector3()

      const widthHalf = 0.5 * width
      const heightHalf = 0.5 * height

      obj.updateMatrixWorld()
      vector.setFromMatrixPosition(obj.matrixWorld)
      vector.project(camera)

      vector.x = ( vector.x * widthHalf ) + widthHalf
      vector.y = - ( vector.y * heightHalf ) + heightHalf

      return {
          x: vector.x,
          y: vector.y
      };
    };
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
