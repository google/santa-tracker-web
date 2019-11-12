import SoundManager from './managers/SoundManager.js'
import RAFManager from './managers/RAFManager.js'
import SceneManager from './components/SceneManager/index.js'

// ui components
import Toolbar from './ui-components/Toolbar.js'
import CameraControls from './ui-components/CameraControls.js'
import ObjectEditTool from './ui-components/ObjectEditTool.js'
import Download from './ui-components/Download.js'
import isTouchDevice from './utils/isTouchDevice.js'

const { Scene, PerspectiveCamera } = self.THREE

class SnowglobeGame {
  static get is() {
    return 'snowglobe-game'
  }

  constructor(el) {
    this.ui = {
      canvas: el.querySelector('#canvas'),
      toolbar: el.querySelector('[toolbar]'),
      cameraControls: el.querySelector('[camera-controls]'),
      objectEditTool: el.querySelector('[object-edit-tool]'),
      download: el.querySelector('[data-download]')
    }

    this.render = this.render.bind(this)

    this.isTouchDevice = isTouchDevice()

    // init scene
    SceneManager.init(this.ui.canvas)
    RAFManager.init()

    // init ui components
    new Toolbar(this.ui.toolbar)
    new CameraControls(this.ui.cameraControls)
    new ObjectEditTool(this.ui.objectEditTool)
    new Download(this.ui.download)

    // stats
    this.stats = new self.Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom)

    // listen raf
    window.addEventListener('RAF', this.render)
  }

  render(e) {
    const { now } = e.detail
    this.stats.begin()
    SceneManager.update(now)
    this.stats.end()
  }

  setup() {}

  update() {}

  teardown() {}

  start() {}
  resume() {}
}

customElements.define(SnowglobeGame.is, SnowglobeGame)

export default SnowglobeGame
