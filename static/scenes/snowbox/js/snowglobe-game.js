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
    this.objectRotateDownUi = element.querySelector('[object-rotate-down-ui]')
    this.objectRotateRightUi = element.querySelector('[object-rotate-right-ui]')
    this.objectEditUi = element.querySelector('[object-edit-ui]')
    this.objectScaleSlider = element.querySelector('[object-scale-slider]')
    this.sceneManager = new SceneManager(this.canvas)

    this.objectRotateRightUi.style.display = `none`
    this.objectRotateDownUi.style.display = 'none'
    this.objectEditUi.style.display = `none`

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
        this.sceneManager.onButtonClick(button.dataset.button)
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
        this.objectRotateDownUi.style.display = `block`
        this.objectEditUi.style.display = `block`
        this.objectRotateRightUi.style.display = `block`
        updateEditToolsPos()
      }
    })

    this.sceneManager.addListener('move_camera', () => {
      if (this.sceneManager.activeSubject && this.sceneManager.mode === 'edit') {
        updateEditToolsPos()
      }
    })

    this.sceneManager.addListener('leave_edit', () => {
      this.objectRotateRightUi.style.display = 'none'
      this.objectRotateDownUi.style.display = 'none'
      this.objectEditUi.style.display = 'none'
    })

    const updateEditToolsPos = () => {
      const rightPosition = getPosition('x')
      this.objectRotateRightUi.style.transform = `translate(-50%, -50%) translate(${rightPosition.x}px,${rightPosition.y}px)`

      const downPosition = getPosition('y')
      this.objectRotateDownUi.style.transform = `translate(-50%, -50%) translate(${downPosition.x}px,${downPosition.y}px)`

      const scale = this.sceneManager.activeSubject.xCircle.scale.x

      let ghostPos = new THREE.Vector3()
      this.sceneManager.activeSubject.mesh.getWorldPosition(ghostPos)
      ghostPos.y -= (this.sceneManager.activeSubject.box.max.y - this.sceneManager.activeSubject.box.min.y) / 2
      ghostPos.x += (this.sceneManager.activeSubject.box.max.x - this.sceneManager.activeSubject.box.min.x) / 2
      ghostPos.z += (this.sceneManager.activeSubject.box.max.z - this.sceneManager.activeSubject.box.min.z) / 2
      ghostPos.project(this.sceneManager.cameraCtrl.camera)
      this.objectEditUi.style.transform = `translate(-50%, -50%) translate(${(ghostPos.x * 0.5 + 0.5) *
        this.canvas.clientWidth}px,${(ghostPos.y * -0.5 + 0.5) * this.canvas.clientHeight + 100}px)`
    }

    const getPosition = axis => {
      const scale = this.sceneManager.activeSubject.xCircle.scale.x
      const { radius } =
        axis === 'x'
          ? this.sceneManager.activeSubject.xCircle.geometry.boundingSphere
          : this.sceneManager.activeSubject.yCircle.geometry.boundingSphere

      let tempPos = new THREE.Vector3()
      this.sceneManager.activeSubject.mesh.getWorldPosition(tempPos)
      tempPos[axis] += radius * scale
      tempPos.project(this.sceneManager.cameraCtrl.camera)
      const x = (tempPos.x * 0.5 + 0.5) * this.canvas.clientWidth
      const y = (tempPos.y * -0.5 + 0.5) * this.canvas.clientHeight

      return { x, y }
    }
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
