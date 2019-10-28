import './managers/VRMLLoader.js'
import './managers/CannonDebugRenderer.js'
import SceneManager from './components/SceneManager/index.js'

const { Scene, PerspectiveCamera } = self.THREE

class SnowglobeGame {
  static get is() {
    return 'snowglobe-game'
  }

  constructor(element) {
    const canvas = element.querySelector('#canvas')
    const actionBtns = [...element.querySelectorAll('[data-button]')]
    const sceneManager = new SceneManager(canvas)

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
          if (sceneManager.mode !== 'ghost') {
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
