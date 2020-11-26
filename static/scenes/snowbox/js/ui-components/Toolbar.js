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
import pushButton from '../utils/pushButton.js'

export default class Toolbar {
  constructor(el) {
    this.el = el

    this.ui = {
      items: [...this.el.querySelectorAll('[data-toolbar-shape]')],
      arrows: [...this.el.querySelectorAll('[data-toolbar-arrow]')],
      slider: this.el.querySelector('.toolbar__slider'),
    }

    this.isTouchDevice = isTouchDevice()

    this.currentIndex = 0
    this.x = 0

    this.onArrowDown = this.onArrowDown.bind(this)
    this.setUnits = this.setUnits.bind(this)

    this.setUnits()

    this.events()
  }

  events() {
    window.addEventListener('resize', this.setUnits)

    this.ui.arrows.forEach(arrow => {
      arrow.addEventListener('mousedown', this.onArrowDown)
      arrow.addEventListener('mouseenter', this.onArrowOver)
    })

    this.ui.items.forEach(item => {
      if (this.isTouchDevice) {
        item.addEventListener('touchstart', this.onClickShape)
      } else {
        item.addEventListener('mousedown', this.onClickShape)
        item.addEventListener('mouseenter', this.onMouseOver)
        item.addEventListener('mouseout', this.onMouseOut)
      }
    })
  }

  onMouseOver() {
    SoundManager.play('snowbox_shape_mouseover')
  }

  onMouseOut() {
    SoundManager.play('snowbox_shape_mouseout')
  }

  onClickShape(e) {
    if (e.type !== 'touchstart') {
      e.preventDefault()
    }

    const button = e.currentTarget
    const { toolbarShape, shapeMaterial } = button.dataset
    Scene.isInCanvas = false
    Scene.addShape(toolbarShape, shapeMaterial)

    SoundManager.play('snowbox_toolbox_select')
  }

  onArrowOver() {
    SoundManager.play('snowbox_generic_hover')
  }

  onArrowDown(e) {
    if (this.offsetXSlider > 0) return

    const el = e.currentTarget
    pushButton(el)
    const { toolbarArrow } = el.dataset
    let index = this.currentIndex
    let direction = 1

    if (toolbarArrow === 'left') {
      direction = -1
      index -= 1
    }

    if (index < 0 || index === this.ui.items.length - 1 || this.x < this.offsetXSlider - this.ui.items[this.ui.items.length - 1].offsetWidth && direction === 1) return

    this.x += this.ui.items[index].offsetWidth * -direction

    this.currentIndex += direction

    this.ui.items.forEach(item => {
      if (item.classList.contains('no-transition')) {
        item.classList.remove('no-transition')
      }
      item.style.transform = `translateX(${this.x}px)`
    })

    SoundManager.play('generic_button_click')
  }

  setUnits() {
    this.x = 0
    this.currentIndex = 0
    this.totalItemsWidth = 0

    this.ui.items.forEach(item => {
      this.totalItemsWidth += item.offsetWidth
      item.classList.add('no-transition')
      item.style.transform = 'none'
    })

    this.sliderWidth = this.ui.slider.offsetWidth
    this.offsetXSlider = this.sliderWidth - this.totalItemsWidth
    if (this.offsetXSlider > 0) {
      this.el.classList.add('no-arrow')
    } else {
      this.el.classList.remove('no-arrow')
    }
  }
}
