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
goog.provide('app.PresentSystem');

goog.require('app.Present');

class PresentSystem {
    constructor(placeholderScene) {
        this.loader = new THREE.OBJLoader();
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
        giftWrapMaterial = new THREE.MeshToonMaterial( {color: 0x009BFF}); // blue
      } else if (box_color === 1) {
        giftWrapMaterial =new THREE.MeshToonMaterial( {color: 0x9445B5}); // purple
      } else if (box_color === 2) {
        giftWrapMaterial = new THREE.MeshToonMaterial( {color: 0x63BC71}); // green
      } else {
        giftWrapMaterial = new THREE.MeshToonMaterial( {color: 0xFF2400}); // red
      }
      var present = new Present(this.loader, this.placeholderScene, giftWrapMaterial);
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
            const index = this.presents.indexOf(present);
            if (index > -1) {
              this.presents.splice(index, 1);
            }
            this.placeholderScene.getScene().remove(present.model);
          } else {
            present.update(this.seconds);
          }
        }
    }

}

app.PresentSystem = PresentSystem;
