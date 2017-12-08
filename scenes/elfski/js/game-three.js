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

import * as loader from './three/loader.js';
import * as vec from './vec.js';
import {Character} from './physics.js';

const cameraOffset = Object.freeze(new THREE.Vector3(400, 400, 20));

/**
 * @export
 */
app.GameThree = class GameThree {
  constructor(canvas, assetBaseUrl) {
    this._canvas = canvas;

    const opts = {
      canvas,
      premultipliedAlpha: false,
    };
    this._renderer = new THREE.WebGLRenderer(opts);
    this._renderer.autoClear = true;
    this._renderer.setClearColor(0xf5f2e2);

    this._camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 2000);
    // this._camera = new THREE.PerspectiveCamera( 45, 4 / 3, 1, 1000 );

    this._camera.position.set(0, 0, 0);
    this._camera.position.add(cameraOffset);
    this._camera.lookAt(0, 0, 0);

    this._scene = new THREE.Scene();
//    this._scene.add(this._camera);

    const scene = this._scene;
var directionalLight = new THREE.DirectionalLight( 0xdddddd );
directionalLight.position.set( 0, 10, 1 ).normalize();
scene.add( directionalLight );

var geometry = new THREE.BoxGeometry( 50, 50, 50 );
var material = new THREE.MeshLambertMaterial( { color: 0xffffff, overdraw: 0.5 } );
for ( var i = 0; i < 100; i ++ ) {
	var cube = new THREE.Mesh( geometry, material );
	cube.scale.y = Math.floor( Math.random() * 2 + 1 );
	cube.position.x = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
	cube.position.y = ( cube.scale.y * 50 ) / 2;
	cube.position.z = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
	scene.add( cube );
}

    const gridHelper = new THREE.GridHelper(1000, 20);
    this._scene.add(gridHelper);

    loader.gltf('elfskiing', assetBaseUrl)
        .then((gltf) => this._prepareModel(gltf))
        .then((object) => {
          this._scene.add(object);

          object.position.set(0, 0, 0);
          object.lookAt(100, 0, 0);  // down

          this._skiier = object;
        });

    loader.texture('tiles', assetBaseUrl).then((texture) => {
      console.info('got texture', texture);
    });

    this._character = new Character();
  }

  measure() {
    // force proper reeval of size
    this._canvas.style.width = null;
    this._canvas.style.height = null;
    const w = this._canvas.offsetWidth;
    const h = this._canvas.offsetHeight;

    const c = this._camera;
    if (c.isOrthographicCamera) {
      c.aspect = w / h;
      c.left = -w / 2;
      c.right = w / 2;
      c.top = h / 2;
      c.bottom = -h / 2;
      c.updateProjectionMatrix();
      c.updateMatrixWorld();
    }

    this._width = w;
    this._height = h;

    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(w, h, true);
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }

  reset() {
    
  }

  /**
   * @param {number} delta fraction of second
   * @param {vec.Vector} pointer position relative to player
   * @param {boolean} ended whether to not move the player
   * @export
   */
  tick(delta, pointer, ended) {
    const change = ended ? {x: 0, y: 0} : this._character.tick(delta, pointer);
    const unitScale = {x: 400, y: -600};

    const cv = vec.multVec(change, unitScale);

    const p = this._skiier.position;
    this._skiier.position.set(p.x - cv.y, 0, p.z - cv.x);

    const angle = this._character.angleVec;
    this._skiier.lookAt(p.x + angle.y, 0, p.z - angle.x);

    const mult = 50;
    this._camera.position.set(p.x + angle.y * mult, 0, p.z - angle.x * mult);
    this._camera.position.add(cameraOffset);
    this._camera.lookAt(p);

  }

  get transform() {
    const p = this._skiier.position;
    return {
      x: p.x,
      y: -p.y,
    };
  }

  get playerAt() {
    const p = this._skiier.position;
    return {
      x: p.x,
      y: p.y,
    };
  }

  _prepareModel(gltf) {
    const object = gltf.scene;
    const elf = object.children[0];

    console.info('got elf', elf);

    const material = elf.material.clone();
    const map = material.map.clone();

    // elf.material = material;
    // material.map = map;
    material.transparent = true;

    elf.scale.multiplyScalar(5.0);

    return elf;
    // this.ensureCorrectTextureImage();
  }
}