/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.GameThree');

/**
 * @export
 */
app.GameThree = class GameThree {
  constructor(canvas) {
    this._canvas = canvas;

    const opts = {
      canvas,
    };
    this._renderer = new THREE.WebGLRenderer(opts);
    this._renderer.autoClear = true;
    this._renderer.setClearColor(0xf5f2e2);

    this._camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 100000);
    this._scene = new THREE.Scene();
  }

  measure() {
    this._width = this._canvas.innerWidth;
    this._height = this._canvas.innerHeight;

    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(this._width, this._height, true);
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }

  reset() {
    
  }

  tick() {
    // TODO
  }

  get transform() {
    return {x: 0, y: 0};
  }

  get playerAt() {
    return {x: 0, y: 0};
  }
}