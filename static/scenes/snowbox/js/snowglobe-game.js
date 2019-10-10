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

    const stats = new self.Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    const bindEventListeners = () => {
      window.addEventListener('resize', () => {
        sceneManager.onWindowResize()
      })

      document.addEventListener('keydown', e => {
        e.preventDefault()
        sceneManager.onKeydown(e)
      })

      canvas.addEventListener(
        'click',
        e => {
          if (sceneManager.state === 'is-dragging') return false

          e.preventDefault()
          sceneManager.onClick(e)
        },
        false
      )

      //
      canvas.addEventListener(
        'mousemove',
        e => {
          e.preventDefault()
          if (sceneManager.mouseState === 'down' && sceneManager.state !== 'ghost' && sceneManager.state !== 'moving-to') {
            canvas.classList.add('is-dragging')
            sceneManager.state = 'is-dragging'
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
        },
        false
      )

      canvas.addEventListener(
        'mouseup',
        e => {
          e.preventDefault()
          sceneManager.mouseState = 'up'

          if (sceneManager.state === 'is-dragging') {
            // add delay to counter conflict with click event
            setTimeout(() => {
              canvas.classList.remove('is-dragging')
              sceneManager.state = ''
            }, 10)
          } else {
            canvas.classList.remove('is-dragging')
            sceneManager.state = ''
          }
        },
        false
      )

      actionBtns.forEach(button => {
        button.addEventListener('click', e => {
          e.preventDefault()
          sceneManager.onButtonClick(button.id)
          sceneManager.state = 'ghost'
        })
      })
    }

    const render = () => {
      stats.begin()
      sceneManager.update()
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
