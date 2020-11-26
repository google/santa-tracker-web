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

import SoundManager from '../managers/SoundManager.js'
import CameraController from '../components/CameraController/index.js'
import pushButton from '../utils/pushButton.js'

export default class CameraControls {
  constructor(el) {
    this.el = el

    this.ui = {
      zoomButtons: [...this.el.querySelectorAll('[data-zoom]')],
      rotateButtons: [...this.el.querySelectorAll('[data-rotate-camera]')]
    }

    this.onClickZoom = this.onClickZoom.bind(this)
    this.onClickRotate = this.onClickRotate.bind(this)

    this.events()
  }

  events() {
    this.ui.zoomButtons.forEach(button => {
      button.addEventListener('click', this.onClickZoom)
      button.addEventListener('mouseenter', this.playHoverSound)
    })

    this.ui.rotateButtons.forEach(button => {
      button.addEventListener('click', this.onClickRotate)
      button.addEventListener('mouseenter', this.playHoverSound)
    })
  }

  onClickZoom(e) {
    const el = e.currentTarget
    CameraController.zoom(el.dataset.zoom)

    // edit btn class
    this.ui.zoomButtons.forEach(button => {
      if (button.classList.contains('is-disabled') && button !== el) button.classList.remove('is-disabled')
    })
    const { currentZoom, zoomMin, zoomMax } = CameraController
    const disable = currentZoom === zoomMin || currentZoom === zoomMax
    // if last zoom, disable
    pushButton(el, disable)
  }

  onClickRotate(e) {
    const el = e.currentTarget

    if (el.classList.contains('is-disabled')) {
      SoundManager.play('snowbox_fail')
    } else {
      SoundManager.play('snowbox_rotate_camera')
    }

    const { rotateCamera } = el.dataset
    CameraController.rotate(rotateCamera)
    // edit btn class
    let disable = false
    if (rotateCamera === 'top' || rotateCamera === 'bottom') {
      this.ui.rotateButtons.forEach(button => {
        if (button.classList.contains('is-disabled') && button !== el) button.classList.remove('is-disabled')
      })
      const { rotationXZ, rotationXZMin, rotationXZMax } = CameraController
      disable = rotationXZ === rotationXZMin || rotationXZ === rotationXZMax
    }

    pushButton(el, disable)
  }

  playHoverSound() {
    SoundManager.play('snowbox_generic_hover')
  }
}
