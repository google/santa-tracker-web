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
    constructor(placeholderScene) {
        this.placeholderScene = placeholderScene;

        this.currentPresent = null;
        this.presents = [];
        this.seconds = 0;

        this.addNewPresent();
    }

    addNewPresent() {
      var box_color = Math.floor(Math.random() * 5);
      var giftWrapMaterial;
      if (box_color === 0) {
        giftWrapMaterial = material1;
      } else if (box_color === 1) {
        giftWrapMaterial = material2;
      } else if (box_color === 2) {
        giftWrapMaterial = material3;
      } else {
        giftWrapMaterial = material4;
      }
      
      // right now I just parent the object to the camera with an offset in the
      // future we probably want a fixed node
      const presentParent = this.placeholderScene.camera;

      // currently I choose a hand tuned offset. We eventually want to push
      // this off to art with a special node (or not show the present entirely
      const presentOffset = new THREE.Vector3(.125, -.125, -1);

      var present = new Present(
        this.placeholderScene,
        giftWrapMaterial,
        presentParent,
        presentOffset);
      this.presents.push(present);
      this.currentPresent = present;
    }

    shoot(targetPosition) {
      this.currentPresent.shoot(targetPosition);
      this.addNewPresent();
    }

    teardown(game) {
      this.presents = [];
      this.currentPresent = null;
    }

    update(deltaSeconds) {
        this.seconds = this.seconds + deltaSeconds;

        for (let i = 0; i < this.presents.length; i++) {
          const present = this.presents[i];
          if (present.landed) {
            this.presents.splice(i, 1);

            present.removeFromScene();
            i--;
          } else {
            present.update(this.seconds, deltaSeconds);
          }
        }
    }

}

app.PresentSystem = PresentSystem;
