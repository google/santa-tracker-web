import SceneManager from './components/SceneManager/index.js'

const { Scene, PerspectiveCamera } = self.THREE

class SnowglobeGame {
  static get is() {
    return 'snowglobe-game'
  }

  constructor(element) {
    const canvas = element.querySelector('#canvas')
    const actionBtns = [...element.querySelectorAll('[data-button]')]
    const rotateBtn = element.querySelector('[data-rotate-button]')
    const objectRotateRightUi = element.querySelector('[object-rotate-right-ui]')
    const objectEditUi = element.querySelector('[object-edit-ui]')
    const objectScaleSlider = element.querySelector('[object-scale-slider]')
    const sceneManager = new SceneManager(canvas)

    objectRotateRightUi.style.display = `none`
    objectEditUi.style.display = `none`

    const stats = new self.Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)

    const bindEventListeners = () => {
      window.addEventListener('resize', () => {
        sceneManager.onWindowResize()
      })

      document.addEventListener('keydown', e => {
        sceneManager.onKeydown(e)
      })

      canvas.addEventListener(
        'mousemove',
        e => {
          e.preventDefault()
          if (sceneManager.mouseState === 'down' && sceneManager.mode === '') {
            sceneManager.setMode('drag')
          }
          sceneManager.onMouseMove(e)
        },
        false
      )

      canvas.addEventListener(
        'mousedown',
        e => {
          e.preventDefault()
          sceneManager.mouseState = 'down'
          sceneManager.onMouseDown(e)
        },
        false
      )

      canvas.addEventListener(
        'mouseup',
        e => {
          e.preventDefault()
          sceneManager.mouseState = 'up'
          if (sceneManager.mode !== 'move' && sceneManager.mode !== 'edit') {
            sceneManager.setMode()
          }
        },
        false
      )

      canvas.addEventListener('wheel', e => {
        e.preventDefault()
        sceneManager.onWheel(e)
      })

      actionBtns.forEach(button => {
        button.addEventListener('click', e => {
          e.preventDefault()
          sceneManager.onButtonClick(button.dataset.button)
          button.classList.add('is-clicked')
          setTimeout(() => {
            button.classList.remove('is-clicked')
          }, 200)
        })
      })

      let rotateInterval

      rotateBtn.addEventListener('mousedown', e => {
        e.preventDefault()
        rotateInterval = setInterval(() => {
          sceneManager.onButtonClick(rotateBtn.dataset.rotateButton)
          rotateBtn.classList.add('is-clicked')
        }, 100)
      })

      rotateBtn.addEventListener('mouseup', e => {
        e.preventDefault()
        clearInterval(rotateInterval)
        setTimeout(() => {
          rotateBtn.classList.remove('is-clicked')
        }, 200)
      })

      objectScaleSlider.addEventListener('input', e => {
        sceneManager.onScaleInput(e)
      })

      sceneManager.addListener('enter_edit', () => {
        if (sceneManager.selectedSubject && sceneManager.mode === 'edit') {
          const { radius } = sceneManager.selectedSubject.xCircle.geometry.boundingSphere
          let tempPos = new THREE.Vector3()
          sceneManager.selectedSubject.ghost.getWorldPosition(tempPos)
          tempPos.x += radius
          tempPos.project(sceneManager.cameraCtrl.camera)
          const x = (tempPos.x * 0.5 + 0.5) * canvas.clientWidth
          const y = (tempPos.y * -0.5 + 0.5) * canvas.clientHeight
          objectRotateRightUi.style.display = `block`
          objectRotateRightUi.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`

          //
          let ghostPos = new THREE.Vector3()
          sceneManager.selectedSubject.ghost.getWorldPosition(ghostPos)
          ghostPos.y -= (sceneManager.selectedSubject.box.max.y - sceneManager.selectedSubject.box.min.y) / 2
          ghostPos.x += (sceneManager.selectedSubject.box.max.x - sceneManager.selectedSubject.box.min.x) / 2
          ghostPos.z += (sceneManager.selectedSubject.box.max.z - sceneManager.selectedSubject.box.min.z) / 2
          ghostPos.project(sceneManager.cameraCtrl.camera)
          objectEditUi.style.display = `block`
          objectEditUi.style.transform = `translate(-50%, -50%) translate(${(ghostPos.x * 0.5 + 0.5) *
            canvas.clientWidth}px,${(ghostPos.y * -0.5 + 0.5) * canvas.clientHeight + 50}px)`
        }
      })

      sceneManager.addListener('leave_edit', () => {
        objectRotateRightUi.style.display = `none`
        objectEditUi.style.display = `none`
      })
    }

    const render = now => {
      stats.begin()
      sceneManager.update(now)
      stats.end()

      requestAnimationFrame(render)
    }

    bindEventListeners()
    render()
  }

  setup() {}

  update() {}

  teardown() {}

  start() {}
  resume() {}
}

customElements.define(SnowglobeGame.is, SnowglobeGame)

export default SnowglobeGame
