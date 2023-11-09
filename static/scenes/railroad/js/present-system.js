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

export class PresentSystem {
    constructor(placeholderScene) {
        this.loader = new THREE.OBJLoader();
        this.placeholderScene = placeholderScene;
        const material0 = new THREE.MeshToonMaterial( {color: 0xF9D231} ); 
        const material1 = new THREE.MeshToonMaterial( {color: 0x009BFF});

        this.currentPresent = null;
        

        this.loader.load( "models/gift.obj", obj => {
            obj.scale.setScalar(0.001);
            for (let i = 0; i < obj.children.length; i++) {          
                if (i !== 4) {
                  obj.children[i].material = material0;
                } else {
                  obj.children[i].material = material1;
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

    update() {
        const nowSeconds = Date.now() / 1000;
        // Set present in front of camera
        if (this.currentPresent) {
          this.currentPresent.position.copy(this.placeholderScene.getCameraPosition(nowSeconds + 2));
        }
    }

}