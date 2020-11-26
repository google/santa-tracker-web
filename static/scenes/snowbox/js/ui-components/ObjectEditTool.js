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
import isTouchDevice from '../utils/isTouchDevice.js'
import { RELEASE_BUTTON_TIME } from '../constants/index.js'

export default class ObjectEditTool {
  constructor(el) {
    this.el = el

    this.ui = {
      rotateButtons: [...this.el.querySelectorAll('[data-rotate-object]')],
      colorButtons: [...this.el.querySelectorAll('[data-color-subject]')],
      scaleButton: this.el.querySelector('[object-scale-slider]'),
      colorIconButton: this.el.querySelector('[data-open-colors]'),
      toolbar: this.el.querySelector('[object-toolbar-ui]'),
      rotateRight: this.el.querySelector('[object-rotate-right-ui]'),
      rotateBottom: this.el.querySelector('[object-rotate-bottom-ui]'),
      trash: this.el.querySelector('[object-trash-ui]'),
      trashButton: this.el.querySelector('[data-trash-object]'),
    }

    this.state = 'is-hidden'

    this.resetRotateTimeout = {}
    this.rotateIntervals = {}

    this.isTouchDevice = isTouchDevice()

    this.bind()
    this.hide()
    this.events()
  }

  bind() {
    this.updatePosition = this.updatePosition.bind(this)
    this.enterEditMode = this.enterEditMode.bind(this)
    this.hide = this.hide.bind(this)
    this.resetRotateButtons = this.resetRotateButtons.bind(this)
    this.onMouseDownRotate = this.onMouseDownRotate.bind(this)
    this.deleteObject = this.deleteObject.bind(this)
  }

  events() {
    if (this.isTouchDevice) {
      this.ui.colorIconButton.addEventListener('touchstart', this.onClickColorIcon)
      this.ui.trashButton.addEventListener('touchstart', this.deleteObject)
    } else {
      this.ui.colorIconButton.addEventListener('click', this.onClickColorIcon)
      this.ui.trashButton.addEventListener('mousedown', this.deleteObject)
      this.ui.trashButton.addEventListener('mouseenter', this.playHoverSound)
    }

    this.ui.scaleButton.addEventListener('input', Scene.onScaleInput)

    window.addEventListener('resize', this.updatePosition)

    this.ui.colorButtons.forEach(button => {
      if (this.isTouchDevice) {
        button.addEventListener('touchstart', Scene.colorSubject)
      } else {
        button.addEventListener('click', Scene.colorSubject)
      }
    })

    this.ui.rotateButtons.forEach(button => {
      if (this.isTouchDevice) {
        button.addEventListener('touchstart', this.onMouseDownRotate)
        button.addEventListener('touchend', this.resetRotateButtons)
      } else {
        button.addEventListener('mousedown', this.onMouseDownRotate)
        button.addEventListener('mouseup', this.resetRotateButtons)
        button.addEventListener('mouseenter', this.playHoverSound)
      }
    })

    // custom events
    window.addEventListener('ENTER_EDIT', this.enterEditMode)
    window.addEventListener('LEAVE_EDIT', this.hide)
    window.addEventListener('UPDATE_EDIT', this.updatePosition)
  }

  enterEditMode() {
    if (!Scene.activeSubject) return
    const { scaleFactor } = Scene.activeSubject // get current scale of object
    this.ui.scaleButton.value = scaleFactor * 10
    setTimeout(() => { // temporary workaround, need to understand why we need that
      this.show()
      this.updatePosition()
    }, 100)
  }

  show() {
    if (Scene.activeSubject) {
      this.el.classList.add('is-showed')
      this.state = 'is-showed'
      if (!Scene.activeSubject.editable) {
        this.el.classList.add('not-editable')
      }
    }
  }

  hide() {
    this.resetRotateButtons()
    this.ui.colorIconButton.classList.remove('is-open')
    this.el.classList.remove('is-showed')
    this.state = 'is-hidden'
    this.el.classList.remove('not-editable')
  }

  updatePosition() {
    if (this.state === 'is-hidden') return

    if (Scene.activeSubject && Scene.activeSubject.editable) {
      const xArrowHelper = Scene.scene.getObjectByName('arrow-helper-x') // would be nice if we can store this value somewhere
      if (xArrowHelper) {
        const xArrowHelperPos = Scene.getScreenPosition(xArrowHelper)
        this.ui.rotateRight.style.transform = `translate(-50%, -50%) translate(${xArrowHelperPos.x}px,${xArrowHelperPos.y}px)`
      }

      const yArrowHelper = Scene.scene.getObjectByName('arrow-helper-y')
      if (yArrowHelper) {
        const yArrowHelperPos = Scene.getScreenPosition(yArrowHelper)
        this.ui.rotateBottom.style.transform = `translate(-50%, -50%) translate(${yArrowHelperPos.x}px,${yArrowHelperPos.y}px)`
      }
    }

    const trashHelper = Scene.scene.getObjectByName('trash-helper')
    if (trashHelper) {
      const trashHelperPos = Scene.getScreenPosition(trashHelper)
      this.ui.trash.style.transform = `translate(-50%, -50%) translate(${trashHelperPos.x}px,${trashHelperPos.y}px)`
    }

    const toolbarHelper = Scene.scene.getObjectByName('toolbar-helper')
    if (toolbarHelper) {
      const toolbarHelperPos = Scene.getScreenPosition(toolbarHelper)
      this.ui.toolbar.style.transform = `translate(-50%, -50%) translate(${toolbarHelperPos.x}px,${toolbarHelperPos.y}px)`
    }
  }

  onClickColorIcon(e) {
    const el = e.currentTarget
    el.classList.toggle('is-open')
    if (el.classList.contains('is-open')) {
      SoundManager.play('snowbox_open_colors')
    }
  }

  playHoverSound() {
    SoundManager.play('snowbox_generic_hover')
  }

  onMouseDownRotate(e) {
    this.ui.rotateButtons.forEach(button => {
      clearInterval(this.rotateIntervals[button])
      clearTimeout(this.resetRotateTimeout[button])
    })

    const el = e.currentTarget
    Scene.rotateObject(el)

    el.classList.add('is-clicked')

    this.rotateIntervals[el] = setInterval(() => {
      Scene.rotateObject(el)
    }, RELEASE_BUTTON_TIME)
  }

  resetRotateButtons() {
    this.ui.rotateButtons.forEach(button => {
      clearInterval(this.rotateIntervals[button])
      this.resetRotateTimeout[button] = setTimeout(() => {
        button.classList.remove('is-clicked')
      }, RELEASE_BUTTON_TIME)
    })
  }

  deleteObject(e) {
    const el = e.currentTarget
    el.classList.add('is-clicked')

    setTimeout(() => {
      SoundManager.play('snowbox_shape_delete')
      Scene.deleteObject()
      this.hide()
      el.classList.remove('is-clicked')
    }, RELEASE_BUTTON_TIME)
  }
}
