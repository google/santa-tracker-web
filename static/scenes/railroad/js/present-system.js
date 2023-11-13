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

class PresentSystem {
    constructor(placeholderScene) {
        this.loader = new THREE.OBJLoader();
        this.placeholderScene = placeholderScene;
        const material0 = new THREE.MeshToonMaterial( {color: 0xF9D231}); 
        const material1 = new THREE.MeshToonMaterial( {color: 0x009BFF}); // blue
        const material2 = new THREE.MeshToonMaterial( {color: 0x9445B5}); // purple
        const material3 = new THREE.MeshToonMaterial( {color: 0x63BC71}); // green
        const material4 = new THREE.MeshToonMaterial( {color: 0xFF2400}); // red

        this.currentPresent = null;
        this.seconds = 0;

        this.loader.load( "models/gift.obj", obj => {
            obj.scale.setScalar(0.001);
            for (let i = 0; i < obj.children.length; i++) {          
                if (i !== 4) {
                  obj.children[i].material = material0;
                } else {
                  var box_color = Math.floor(Math.random() * 5);
                  console.log("box_color: " + box_color);
                  if (box_color === 0) {                  
                    obj.children[i].material = material1;
                  } else if (box_color === 1) {
                    obj.children[i].material = material2;
                  } else if (box_color === 2) {
                    obj.children[i].material = material3;
                  } else {
                    obj.children[i].material = material4;
                  }
                }
              }
            this.currentPresent = obj;
            this.placeholderScene.getScene().add(obj);
            console.log("Present added");
        });
    }

    teardown(game) {
        this.currentPresent = null;
    }

    update(deltaSeconds) {
        this.seconds = this.seconds + deltaSeconds;
        // Set present in front of camera
        if (this.currentPresent) {
          this.currentPresent.position.copy(this.placeholderScene.getCameraPosition(this.seconds + 2));
        }
    }

}

app.PresentSystem = PresentSystem;
