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

const { Vector3 } = self.THREE;

const intermediateVector3 = new Vector3();

export class TetheredCameraTracker {
  constructor(camera, tetherDistance = 100.0, acceleration = 0.15) {
    this.camera = camera;
    this.target = null;

    this.tetherDistance = tetherDistance;
    this.acceleration = acceleration;
    this.velocity = new Vector3(0.0, 0.0, 0.0);
  }

  update(game) {
    if (!this.target) {
      return;
    }

    const { width, height } = game;
    const delta = intermediateVector3;
    // TODO(cdata): Need to address why the y axis of the camera is
    // inverted relative to the gimbal. Flipping it here for now:
    delta.copy(this.target.position);
    delta.y *= -0.75;
    delta.subVectors(delta, this.camera.position);
    delta.z = 0;

    const deltaLength = delta.length();

    if (deltaLength >= this.tetherDistance) {
      delta.normalize().multiplyScalar(this.acceleration);
      this.velocity.add(delta);
    } else {
      delta.normalize().multiplyScalar(
          length / this.tetherDistance * this.acceleration);
      this.velocity.sub(delta);
    }

    if (this.velocity.length() > 0.1) {
      this.velocity.x = this.velocity.x > 0 ? this.velocity.x - 0.1 : this.velocity.x + 0.1;
      this.velocity.y = this.velocity.y > 0 ? this.velocity.y - 0.1 : this.velocity.y + 0.1;
    } else {
      this.velocity.set(0.0, 0.0, 0.0);
    }

    this.camera.position.add(this.velocity);
  }
};
