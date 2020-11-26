/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Scene from '../components/Scene/index.js'
import SoundManager from '../managers/SoundManager.js'
import LoaderManager from '../managers/LoaderManager.js'
import CameraController from '../components/CameraController/index.js'
import pushButton from '../utils/pushButton.js'

export default class Download {
  constructor(el) {
    this.el = el

    this.ui = {
      popin: document.body.querySelector('[download-popin]'),
      gif: document.body.querySelector('[gif]'),
      link: document.body.querySelector('[download-link]'),
      exit: document.body.querySelector('[download-exit]'),
      canvas: document.body.querySelector('#canvas'),
    }

    this.maxGIFWidth = 1200

    this.bind()
    this.events()
    this.updateAspectRatio()
  }

  bind() {
    this.generateGIF = this.generateGIF.bind(this)
    this.renderFrames = this.renderFrames.bind(this)
    this.onClickOutside = this.onClickOutside.bind(this)
    this.open = this.open.bind(this)
    this.exit = this.exit.bind(this)
  }

  events() {
    document.body.addEventListener('click', this.onClickOutside)

    this.el.addEventListener('mousedown', this.open)
    this.el.addEventListener('mouseenter', this.playHoverSound)
    this.ui.popin.addEventListener('click', e => e.stopPropagation)
    this.ui.link.addEventListener('click', e => {
      SoundManager.play('generic_button_click')
      e.stopPropagation()
    })
    this.ui.exit.addEventListener('mousedown', this.exit)
    this.ui.exit.addEventListener('mouseenter', this.playHoverSound)
    this.ui.popin.addEventListener('mouseenter', this.playHoverSound)
    this.ui.link.addEventListener('mouseenter', this.playHoverSound)
  }

  open() {
    pushButton(this.el, null, this.renderFrames, true)
    this.updateAspectRatio()
    this.ui.popin.classList.add('is-open')
    this.ui.popin.classList.add('is-loading')
  }

  exit() {
    pushButton(this.ui.exit, null, null, true)
    this.ui.popin.classList.remove('is-open')
    this.ui.popin.classList.remove('is-loading')
    SoundManager.play('snowbox_generate_gif_end')
  }

  renderFrames() {
    SoundManager.play('snowbox_generate_gif_start')

    // clean mode
    Scene.setMode()

    const originWidth = this.ui.canvas.width
    const originHeight = this.ui.canvas.height
    // Reisze canvas size to avoid 12MB gifs
    const width = Math.min(this.maxGIFWidth, originWidth)
    const height = width * originHeight / originWidth
    this.resizeScene(width, height)

    const sources = []

    for (let i = 0; i < 16; i++) {
      CameraController.rotate('right', true, 22.5)
      // https://stackoverflow.com/questions/9491417/when-webgl-decide-to-update-the-display
      Scene.renderer.render(Scene.scene, CameraController.camera)
      const base64 = Scene.renderer.domElement.toDataURL()
      sources.push(base64)
    }

    // reset canvas size
    this.resizeScene(originWidth, originHeight)

    // wait for every images to load
    LoaderManager.subjects['gif'] = null // clean previous loader
    LoaderManager.load({ name: 'gif', gif: sources }, this.generateGIF)
  }

  resizeScene(width, height) {
    Scene.renderer.setSize(width / window.devicePixelRatio, height / window.devicePixelRatio, false);
    CameraController.camera.aspect = width / height
    CameraController.camera.updateProjectionMatrix()
  }

  generateGIF() {
    const { sources } = LoaderManager.subjects['gif']

    const gif = new GIF({
      workers: 4,
      workerScript: '../../third_party/lib/gif/gif.worker.js',
      quality: 30,
    })

    sources.forEach(source => {
      gif.addFrame(source, { delay: 200 })
    })

    gif.on('finished', blob => {
      if (this.ui.popin.classList.contains('is-loading')) {
        SoundManager.play('snowbox_generate_gif_complete')
      }
      this.ui.popin.classList.remove('is-loading')
      this.ui.gif.src = URL.createObjectURL(blob)
      this.ui.link.href = URL.createObjectURL(blob)
      SoundManager.play('snowbox_generate_gif_end')
    })

    gif.render()
  }

  playHoverSound() {
    SoundManager.play('snowbox_generic_hover')
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
