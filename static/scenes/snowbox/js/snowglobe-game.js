import SceneManager from './components/SceneManager/index.js'

const { Scene, PerspectiveCamera } = self.THREE

class SnowglobeGame {
  static get is() {
    return 'snowglobe-game'
  }

  constructor(element) {
    const canvas = element.querySelector('#canvas')
    const actionBtns = [...element.querySelectorAll('.action-button')]
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
          sceneManager.onButtonClick(button.id)
        })
      })
    }

    const render = () => {
      stats.begin()
      sceneManager.update()
      // console.log(sceneManager.mode) // show current mode
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
