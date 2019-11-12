import SceneManager from '../components/SceneManager/index.js'
import SoundManager from '../managers/SoundManager.js'
import LoaderManager from '../managers/LoaderManager.js'
import CameraController from '../components/CameraController/index.js'

export default class Download {
  constructor(el) {
    this.el = el

    this.ui = {
      popin: document.body.querySelector('[download-popin]'),
      gif: document.body.querySelector('[gif]'),
      link: document.body.querySelector('[download-link]'),
      canvas: document.body.querySelector('#canvas'),
    }

    this.pushButton = this.pushButton.bind(this)
    this.generateGIF = this.generateGIF.bind(this)
    this.onClickOutside = this.onClickOutside.bind(this)

    this.updateAspectRatio()
    this.events()
  }

  events() {
    document.body.addEventListener('click', this.onClickOutside)

    this.el.addEventListener('mousedown', this.pushButton)
    this.ui.popin.addEventListener('click', e => e.stopPropagation)
    this.ui.link.addEventListener('click', e => e.stopPropagation)
  }

  pushButton() {
    this.el.classList.add('is-clicked')
    this.updateAspectRatio()
    this.ui.popin.classList.add('is-open')
    this.ui.popin.classList.add('is-loading')
    setTimeout(() => {
      this.renderFrames()
      this.el.classList.remove('is-clicked')
    }, 200)
  }

  renderFrames() {
    SoundManager.play('snowbox_photo');

    // clean mode
    SceneManager.setMode()

    const sources = []

    for (let i = 0; i < 16; i++) {
      CameraController.rotate('right', false, true, 0.5)
      // https://stackoverflow.com/questions/9491417/when-webgl-decide-to-update-the-display
      SceneManager.renderer.render(SceneManager.scene, CameraController.camera)
      const base64 = SceneManager.renderer.domElement.toDataURL()
      sources.push(base64)
    }

    LoaderManager.subjects['gif'] = null // clean previous loader
    LoaderManager.load({name: 'gif', gif: sources}, this.generateGIF)
  }

  generateGIF() {
    const { sources } = LoaderManager.subjects['gif']

    const gif = new GIF({
      workers: 4,
      workerScript: '../../third_party/lib/gif/gif.worker.js',
      quality: 20,
      // width: this.ui.canvas.offsetWidth / 2,
      // height: this.ui.canvas.offsetHeight / 2,
    })

    sources.forEach(source => {
      gif.addFrame(source, {delay: 200})
    })

    gif.on('finished', blob => {
      this.ui.popin.classList.remove('is-loading')
      this.ui.gif.src = URL.createObjectURL(blob)
      this.ui.link.href = URL.createObjectURL(blob)
    });

    gif.render()
  }

  updateAspectRatio() {
    // update image ratio
    const ratio = this.ui.canvas.offsetHeight / this.ui.canvas.offsetWidth * 100
    this.ui.gif.parentNode.style.paddingBottom = `${ratio}%`
  }

  onClickOutside() {
    const el = this.ui.popin
    if (el.classList.contains('is-open') && !el.classList.contains('is-loading')) {
      el.classList.remove('is-open')
    }
  }
}

