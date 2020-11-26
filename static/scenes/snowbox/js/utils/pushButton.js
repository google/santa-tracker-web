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

import { RELEASE_BUTTON_TIME } from '../constants/index.js'
import SoundManager from '../managers/SoundManager.js'

const isClicked = {}

export default function pushButton(el, disable, callback, sound) {
	if (isClicked[el]) return
  el.classList.add('is-clicked')

  isClicked[el] = true

  if (sound) {
  	SoundManager.play('generic_button_click')
  }

  setTimeout(() => {
  	isClicked[el] = false
    el.classList.remove('is-clicked')
    if (disable) {
      el.classList.add('is-disabled')
    }
    if (callback) {
      callback()
    }
  }, RELEASE_BUTTON_TIME)
}