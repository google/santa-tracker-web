import SceneManager from '../components/SceneManager/index.js'
import SoundManager from '../managers/SoundManager.js'
import LoaderManager from '../managers/LoaderManager.js'
import CameraController from '../components/CameraController/index.js'

export default class Toolbar {
  constructor(el) {
    this.el = el

    this.ui = {
      buttons: [...this.el.querySelectorAll('[data-add-shape]')],
      shareButton: this.el.querySelector('[data-share]'),
      gif: document.body.querySelector('[gif]'),
      gifImage: document.body.querySelector('[gif-image]')
    }

    this.onButtonMouseDown = this.onButtonMouseDown.bind(this)
    this.generateGIF = this.generateGIF.bind(this)
    this.generateGIFframes = this.generateGIFframes.bind(this)
    this.onClickOutside = this.onClickOutside.bind(this)

    this.events()
  }

  events() {
    document.body.addEventListener('click', this.onClickOutside)

    this.ui.buttons.forEach(button => {
      button.addEventListener('mousedown', this.onButtonMouseDown)

      button.addEventListener('touchstart', this.onButtonMouseDown)
      button.addEventListener('mouseover', this.onButtonMouseOver)
      button.addEventListener('mouseout', this.onButtonMouseOut)
    })

    this.ui.shareButton.addEventListener('click', this.generateGIF)
    this.ui.gif.addEventListener('click', e => {
      console.log('yes')
      e.stopPropagation()
    })
  }

  onButtonMouseOver(e) {
    SoundManager.play('snowbox_shape_mouseover');
  }

  onButtonMouseOut(e) {
    SoundManager.play('snowbox_shape_mouseout');
  }
  
  onButtonMouseDown(e) {
    e.preventDefault()

    const button = e.currentTarget
    SoundManager.play('snowbox_toolbox_select');

    const mouseLeaveListener = () => {
      e.preventDefault()
      const { addShape, shapeMaterial } = button.dataset
      SceneManager.addShape(addShape, shapeMaterial)
      button.removeEventListener('mouseleave', mouseLeaveListener)
    }

    if (e.type === 'touchstart') {
      SceneManager.addingShape = button
    } else {
      button.addEventListener('mouseleave', mouseLeaveListener)
    }
  }

  generateGIF() {
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
    LoaderManager.load({name: 'gif', gif: sources}, this.generateGIFframes)
    this.ui.gif.classList.add('is-loading')
  }

  generateGIFframes() {
    const { sources } = LoaderManager.subjects['gif']

    const gif = new GIF({
      workers: 2,
      workerScript: '../../third_party/lib/gif/gif.worker.js',
      quality: 5,
    })

    sources.forEach(source => {
      gif.addFrame(source, {delay: 200})
    })

    gif.on('finished', blob => {
      this.ui.gif.classList.remove('is-loading')
      this.ui.gif.classList.add('is-open')
      this.ui.gifImage.src = URL.createObjectURL(blob)
      this.ui.gifImage.parentNode.href = URL.createObjectURL(blob)
    });

    gif.render()
  }

  onClickOutside() {
    const el = this.ui.gif
    if (el.classList.contains('is-open')) {
      el.classList.remove('is-open')
    }
  }
}

