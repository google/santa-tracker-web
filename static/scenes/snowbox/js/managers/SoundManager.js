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

class SoundManager {
  constructor() {
    window.addEventListener('shape_collide', this.playCollisionSound.bind(this))
    this.lastCollisionTime = 0

    this.maxMassForShape = {
      arch: 850,
      sphere: 67,
      tree: 486,
      cube: 411,
      gift: 592,
      pyramid: 536,
      prism: 555,
      snowman: 100,

    }
  }

  playCollisionSound(e) {
    const { force, type, mass } = e.detail
    const pitch = this.getPitch(type, mass)
    const volume = Math.max(0, Math.min(1, (force - 0.5 ) / 3 ))
    this.play('snowbox_collision', volume, pitch, mass > 40)
  }

  getPitch(type, mass) {
    const maxMass = this.maxMassForShape[type] || 100
    const massPitch = Math.min(2, Math.max(0.3, mass / maxMass))
    return Math.abs(1 - massPitch) + 0.5 + Math.random() * 0.2
  }

  play(event, ...args) {
    const argsToSend = [].slice.call(arguments)
    argsToSend.unshift('sound-trigger')
    window.santaApp.fire.apply(this, argsToSend)
  }

  highlightShape(subject) {
    const pitch = this.getPitch(subject.name, subject.currentMass)
    this.play('snowbox_world_shape_highlight', pitch)
  }
}

export default new SoundManager()
