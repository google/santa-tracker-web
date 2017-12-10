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

import noise from './noise.js';
import * as loader from './three/loader.js';
import {Points} from './three/points.js';
import * as vec from './vec.js';
import {Character} from './physics.js';

const cameraOffset = Object.freeze(new THREE.Vector3(400, 400, 20));
const startAtY = 1000;  // when we start at zero, we get ~12 FPS for some reason
const skiierSize = 48;  // magic number that makes us appear through trees

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

    if (true) {
      this._camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 2000);
    } else {
      // for experiments
      this._camera = new THREE.PerspectiveCamera( 45, 4 / 3, 1, 1000 );
    }

    this._camera.position.set(startAtY, 0, 0);
    this._camera.position.add(cameraOffset);
    this._camera.lookAt(startAtY, 0, 0);

    this._scene = new THREE.Scene();

    const scene = this._scene;
    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    loader.gltf('elfskiing', assetBaseUrl)
        .then((gltf) => this._prepareModel(gltf))
        .then((object) => {
          this._scene.add(object);

          object.position.set(startAtY, skiierSize / 2, 0);
          object.lookAt(100, skiierSize / 2, 0);  // down

          this._skiier = object;
        });

    loader.texture('tiles', assetBaseUrl).then((texture) => {
      texture.flipY = false;
      const p = new Points(10000, texture);
      scene.add(p.particles);

      this._p = p;
      this._decorator = new SceneDecorator(this._p);
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
    if (this._p) {
      this._p.update();

      const p = this.playerAt;
      const viewport = {
        from: p.y - (this._height / 2) * 2,
        at: p.y + (this._height / 2) * 2,
        l: p.x - (this._width / 2) * 1.5,
        r: p.x + (this._width / 2) * 1.5,
      };
      this._decorator.update(viewport);
    }
    this._renderer.render(this._scene, this._camera);
  }

  reset() {
    
  }

  dispose() {
    // TODO: anything?
  }

  /**
   * @param {number} delta fraction of second
   * @param {vec.Vector} pointer position relative to player
   * @param {boolean} ended whether to not move the player
   * @export
   */
  tick(delta, pointer, ended) {
    if (!this._skiier) {
      return;
    }

    const change = ended ? {x: 0, y: 0} : this._character.tick(delta, pointer);
    const unitScale = {x: 400, y: -600};

    const cv = vec.multVec(change, unitScale);

    const p = this._skiier.position;
    this._skiier.position.set(p.x - cv.y, skiierSize / 2, p.z - cv.x);

    const angle = this._character.angleVec;
    this._skiier.lookAt(p.x + angle.y, skiierSize / 2, p.z - angle.x);

    const mult = 50;
    this._camera.position.set(p.x + angle.y * mult, 0, p.z - angle.x * mult);
    this._camera.position.add(cameraOffset);
    this._camera.lookAt(p);
  }

  get transform() {
    if (!this._skiier) {
      return vec.zero;
    }
    const p = this._skiier.position;
    return {
      x: -p.z,
      y: -p.x,
    };
  }

  get playerAt() {
    const out = this.transform;
    out.y *= -1;
    return out;
  }

  _prepareModel(gltf) {
    const object = gltf.scene;
    const elf = object.children[0];

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


class SceneDecorator {
  constructor(points, dim=64) {
    this._points = points;

    this._dim = dim;
    this._depth = 0;

    /**
     * @private {!Array<{l: number, r: number}>}
     */
    this._ranges = [];
  }

  /**
   * @param {{from: number, at: number, l: number, r: number}}
   */
  update({from, at, l, r}) {
    const wasDepth = this._depth;
    const high = Math.ceil(at / this._dim)

    // push new depths (hurr hurr)
    for (; this._depth < high; ++this._depth) {
      this._ranges.push({l: 0, r: 0, alloc: []});
    }

    const low = Math.floor(from / this._dim);
    while (this._ranges.length > (high - low)) {
      const last = this._ranges.shift();
      last.alloc.forEach((id) => this._points.free(id));
    }

    const lc = Math.floor(l / this._dim);
    const rc = Math.ceil(r / this._dim);

    const offsetLow = this._depth - this._ranges.length;
    this._ranges.forEach((range, off) => {
      while (range.l > lc) {
        this._decorate(--range.l, off + offsetLow, range.alloc);
      }
      while (range.r <= rc) {
        this._decorate(range.r++, off + offsetLow, range.alloc);
      }
    });
  }

  /**
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  _treeType(x, y) {
    const type = ~~((0.5 + noise(x / 1.00124, y / 0.1241)) * 4);
    if (type < 0) {
      return 0;
    } else if (type > 3) {
      return 3;
    } else {
      return type;
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {!Array<number>} alloc
   */
  _decorate(x, y, alloc) {
    let v = noise(x / 3.27, y / 8.742);
    if (v <= -0.1) {
      return;
    }

    const offX = noise(x / 4.1222, y / 8.2421);
    const offY = noise(x / 1.21, y / 2.31);
    const at = {
      x: this._dim * (x + 0.5 + 2 * offX),
      y: this._dim * (y + 0.5 + 2 * offY),
    };

    const type = this._treeType(x, y);
    const id = this._points.alloc(at.x, at.y, type);
    alloc.push(id);
  }
}
