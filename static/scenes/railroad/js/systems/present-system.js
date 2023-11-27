/**
 * Copyright 2023 Google LLC
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
goog.provide('app.systems.PresentSystem');

goog.require('app.Present');

const material1 = new THREE.MeshToonMaterial( {color: 0x009BFF}); // blue
const material2 = new THREE.MeshToonMaterial( {color: 0x9445B5}); // purple
const material3 = new THREE.MeshToonMaterial( {color: 0x63BC71}); // green
const material4 = new THREE.MeshToonMaterial( {color: 0xFF2400}); // red

class PresentSystem {
  /**
   * @param {app.Scene} scene
   */
  constructor(scene) {
    /** @private {app.Scene} */
    this.scene = scene;

    /** @private {app.Present} */
    this.currentPresent = null;
    /** @private {Array<app.Present>} */
    this.presents = [];

    /** @private {THREE.Object3D} */
    this.presentThrowPosition = scene.getScene().getObjectByName('PresentThrowPosition');
    if (this.presentThrowPosition == undefined) {
      throw new Error('Could not find present start position');
    }
    this.addNewPresent();
  }

  addNewPresent() {
    // For the moment, remove the other colors of presents until we have matching assets.
    var box_color = Math.floor(Math.random() * 5);
    let giftWrapMaterial = material1;
    if (box_color === 0) {
      giftWrapMaterial = material1;
    } else if (box_color === 1) {
      giftWrapMaterial = material2;
    } else if (box_color === 2) {
      giftWrapMaterial = material3;
    } else {
      giftWrapMaterial = material4;
    }

    let present = new app.Present(
      this.scene,
      giftWrapMaterial,
      this.presentThrowPosition,
    );
    this.presents.push(present);
    this.currentPresent = present;
  }

  shoot(targetPosition) {
    this.currentPresent.shoot(targetPosition);
    this.addNewPresent();
  }

  update(deltaSeconds) {
    for (let i = 0; i < this.presents.length; i++) {
      const present = this.presents[i];
      if (present.landed) {
        this.presents.splice(i, 1);

        present.removeFromScene();
        i--;
      } else {
        present.update(deltaSeconds);
      }
    }
  }

}

app.PresentSystem = PresentSystem;
