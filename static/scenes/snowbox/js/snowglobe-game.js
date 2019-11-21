// import SoundManager from './managers/SoundManager.js'
import RAFManager from './managers/RAFManager.js'
import Scene from './components/Scene/index.js'

// ui components
import Toolbar from './ui-components/Toolbar.js'
import CameraControls from './ui-components/CameraControls.js'
import ObjectEditTool from './ui-components/ObjectEditTool.js'
import Download from './ui-components/Download.js'
import SoundButton from './ui-components/SoundButton.js'
import isTouchDevice from './utils/isTouchDevice.js'
import { DEBUG_MODE } from  './constants/index.js'

class SnowglobeGame {
  static get is() {
    return 'snowglobe-game'
  }

  constructor(el) {

    // window.devicePixelRatio = 1.5
    this.ui = {
      canvas: el.querySelector('#canvas'),
      toolbar: el.querySelector('[toolbar]'),
      cameraControls: el.querySelector('[camera-controls]'),
      objectEditTool: el.querySelector('[object-edit-tool]'),
      download: el.querySelector('[data-download]'),
      soundButton: el.querySelector('[data-sound-button')
    }

    this.render = this.render.bind(this)

    this.isTouchDevice = isTouchDevice()

    // init scene
    Scene.init(this.ui.canvas)
    RAFManager.init()

    // init ui components
    new Toolbar(this.ui.toolbar)
    new CameraControls(this.ui.cameraControls)
    new ObjectEditTool(this.ui.objectEditTool)
    new Download(this.ui.download)
    new SoundButton(this.ui.soundButton)

    // stats
    if (DEBUG_MODE) {
      this.stats = new window.Stats()
      this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(this.stats.dom)
    }

    // listen raf
    window.addEventListener('RAF', this.render)
  }

  render(e) {
    const { now } = e.detail
    if (DEBUG_MODE) this.stats.begin()
    Scene.update(now)
    if (DEBUG_MODE) this.stats.end()
  }

  setup() {}

  update() {}

  teardown() {}

  start() {}

  pause() {}

  resume() {}
}

customElements.define(SnowglobeGame.is, SnowglobeGame)

export default SnowglobeGame
