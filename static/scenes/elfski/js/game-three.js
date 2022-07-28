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

import noise from './noise.js';
import * as loader from './three/loader.js';
import {Points} from './three/points.js';
import {SkiTrail} from './three/skitrail.js';
import {Present} from './three/present.js';
import * as vec from './vec.js';
import {Character} from './physics.js';

const cameraOffset = Object.freeze(new THREE.Vector3(800, 800, 0));
const startAtY = 800;
const treeStartAtY = 1000;
const skiierSize = 48;  // magic number that makes us appear through trees
const crashThreshold = 12;  // px from tree base to crash
const crashDuration = 2;  // seconds to crash for
const distanceScoreRatio = 100;
const presentScore = 25;
const unitScale = /** @type {vec.Vector} */ ({x: 400, y: -600});

/**
 * @export
 */
export default class GameThree {
  constructor(canvas, assetBaseUrl) {
    this._canvas = canvas;

    const opts = {
      canvas,
      premultipliedAlpha: false,
    };
    this._renderer = new THREE.WebGLRenderer(opts);
    this._renderer.autoClear = true;
    this._renderer.setClearColor(0xf5f2e2);
    this._renderer.gammaOutput = true;

    if (true) {
      this._camera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 2000);
    } else {
      // for experiments
      this._camera = new THREE.PerspectiveCamera(90, 4 / 3, 10, 10000);
    }

    /**
     * @private {number}
     */
    this._width = 0;

   /**
    * @private {number}
    */
    this._height = 0;

    /**
     * @private {THREE.Object3D}
     */
    this._skiier = null;

    /**
     * @private {SceneDecorator}
     */
    this._decorator = null;

    /**
     * @private {Points}
     */
    this._p = null;

    /**
     * @private {!Character}
     */
    this._character = new Character();

    /**
     * @private {number|undefined}
     */
    this._hitTreeAt = undefined;

    /**
     * @private {THREE.Object3D}
     */
    this._snowball = null;

    /**
     * @private {number}
     */
    this._presentsFound = 0;

    this._scene = new THREE.Scene();
    this._cameraFocus(10, startAtY);

    const scene = this._scene;

    // feature a spotlight that shines onto the elf
    const spot = new THREE.SpotLight(0xffffff);
    spot.power = Math.PI * 2;
    this._spot = spot;
    scene.add(this._spot);

    // always have a background color
    scene.add(new THREE.AmbientLight(0xaaaaaa));

    // load elf and add to scene
    loader.gltf('elf-ski', assetBaseUrl)
        .then((gltf) => this._prepareModel(gltf))
        .then((object) => {
          this._scene.add(object);

          object.position.set(startAtY, skiierSize / 2, 0);
          object.lookAt(startAtY, skiierSize / 2, -100);  // right, to match start camera

          this._skiier = object;
          this._spottarget = object;

          this._internalTick();  // force position
        });

    // load tiles and set up decorator
    loader.texture('tiles', assetBaseUrl).then((texture) => {
      texture.flipY = false;
      const p = new Points(10000, texture);
      scene.add(p);

      this._p = p;
      this._decorator = new SceneDecorator(this._p);
    });

    this._trail = new SkiTrail({x: 0, y: startAtY});
    scene.add(this._trail);
  }

  /**
   * @export
   */
  measure() {
    // force proper reveal of size
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

    this._internalTick();  // force camera reposition
  }

  _cameraFocus(x, y) {
    y += (this._canvas.offsetHeight / 4);  // move up screen
    this._camera.position.set(y, 0, -x);
    this._camera.position.add(cameraOffset);
    this._camera.lookAt(y, 0, -x);
  }

  get presentsFound() {
    return this._presentsFound;
  }

  /**
   * @export
   */
  render() {
    if (this._p && this._hitTreeAt === undefined) {
      this._p.update();

      // TODO(samthor): These are magic numbers, and break down at huge screen heights.
      const p = this.playerAt;
      const viewport = {
        from: p.y - (this._height / 2) * 1,
        at: p.y + (this._height / 2) * 2.5,
        l: p.x - (this._width / 2) * 2.5,
        r: p.x + (this._width / 2) * 2.5,
      };
      this._decorator.update(viewport);
    }
    this._renderer.render(this._scene, this._camera);
  }

  dispose() {
    // TODO: anything?
  }

  /**
   * @param {number} delta fraction of second
   * @param {?number} targetAngle in radians. 0 is straight down == positive y axis.
   * @param {boolean} ended whether to not move the player
   * @export
   */
  tick(delta, targetAngle, ended) {
    if (this._decorator) {
      this._decorator.tick(delta);
    }

    if (!this._skiier) {
      return false;
    } else if (this._hitTreeAt !== undefined) {

      if (this._hitTreeAt < crashDuration) {
        this._hitTreeAt = Math.min(crashDuration, this._hitTreeAt + delta);

        const scale = (this._hitTreeAt / crashDuration);
        this._snowball.scale.set(scale, scale, scale);

        // move in same direction during this time, but slow down
        const change = this._character.tick(delta * (1 - scale), null);
        const cv = vec.multVec(change, unitScale);
        const p = this._skiier.position;

        this._skiier.position.set(p.x - cv.y, skiierSize / 2, p.z - cv.x);
        this._trail.push({x: -p.z, y: p.x});  // awkwardly go back to x,y coord system

        this._skiier.rotateX(delta * -Math.random());  // always fall backwards
        this._skiier.rotateY(delta * (Math.random() - 0.5));
        this._skiier.rotateZ(delta * (Math.random() - 0.5));
      }

      return true;
    }

    const change = ended ? {x: 0, y: 0} : this._character.tick(delta, targetAngle);
    const cv = vec.multVec(change, unitScale);
    if (cv.x || cv.y) {
      this._internalTick(cv);
    }
  }

  /**
   * @param {vec.Vector=} cv
   */
  _internalTick(cv = vec.zero) {
    if (!this._skiier) {
      return;
    }

    const p = this._skiier.position;
    this._skiier.position.set(p.x - cv.y, skiierSize / 2, p.z - cv.x);
    this._trail.push({x: -p.z, y: p.x});  // awkwardly go back to x,y coord system

    const angle = this._character.angleVec;
    const lookAt = new THREE.Vector3(p.x + angle.y, skiierSize / 2, p.z - angle.x);
    this._skiier.lookAt(lookAt.x, lookAt.y, lookAt.z);

    // move spotlight in front of elf, it's focused on it
    this._spot.position.set(p.x + angle.y * 10, skiierSize * 2, p.z - angle.x * 10);

    // look forward, but more Y and less X
    this._cameraFocus(-p.z + angle.x * 10, p.x + angle.y * 50);

    // at
    const playerAt = this.playerAt;

    // get presents at any speed
    if (this._decorator && this._character.speedRatio > 0) {
      const pickups = this._decorator.presentsNear(playerAt);

      if (pickups.length) {
        pickups.forEach((pickup) => pickup.pickup());
        this._presentsFound += pickups.length;
      }
    }

    // can only crash if >0.5 towards max speed
    if (this._decorator && this._character.speedRatio > 0.5) {
      const nearby = this._decorator.treesNear(playerAt);

      const hit = nearby.some((at) => {
        const dist = vec.dist(at, playerAt);
        return dist < crashThreshold;
      });

      if (hit) {
        const size = 5;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({color: 0xffffff,});
        const sphere = new THREE.Mesh(geometry, material);
        sphere.scale.set(0.001, 0.001, 0.001);
        sphere.position.y = (4 - size) / 2;  // skiier is about 4 units below head

        this._skiier.add(sphere);
        this._snowball = sphere;

        this._hitTreeAt = 0;
        return true;
      }
    }

    return false;
  }

  /**
   * @return {vec.Vector}
   */
  get playerAt() {
    if (!this._skiier) {
      return vec.zero;
    }
    const p = this._skiier.position;
    return {
      x: -p.z,
      y: p.x,
    };
  }

  get score() {
    const p = this.playerAt;
    const scoreFrom = startAtY + 50;
    const rawScore =
        Math.floor((p.y - scoreFrom) / distanceScoreRatio) + this._presentsFound * presentScore;
    return Math.max(0, rawScore);
  }

  /**
   * @return {number}
   */
  get angle() {
    return this._character.angle;
  }

 /**
  * @return {number}
  */
  get speed() {
    return this._character.speed;
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

  /**
   * @param {!Points} points
   * @param {number=} dim
   */
  constructor(points, dim=96) {
    this._points = points;

    // every game is different!
    const ox = (Math.random() * 1000 - 500);
    const oy = (Math.random() * 1000 - 500);
    this._noise = (x, y) => {
      return noise(x + ox, y + oy);
    };

    this._dim = dim;
    this._depth = 0;

    this._presents = [];
    this._presentCellY = new WeakMap();

    /**
     * @private {!Array<{l: number, r: number}>}
     */
    this._ranges = [];
  }

  /**
   * @param {{from: number, at: number, l: number, r: number}} args
   */
  update(args) {
    const {from, at, l, r} = args;
    const wasDepth = this._depth;
    const high = Math.ceil(at / this._dim)

    // push new depths
    for (; this._depth < high; ++this._depth) {
      this._ranges.push({l: 0, r: 0, alloc: []});
    }

    const low = Math.floor(from / this._dim);
    let freedAny = false;
    while (this._ranges.length > (high - low)) {
      const last = this._ranges.shift();
      last.alloc.forEach((id) => this._points.free(id));
      freedAny = true;
    }

    if (freedAny) {
      // cleanup presents
      this._presents = this._presents.filter((present) => {
        const cellY = this._presentCellY.get(present) || -1;
        if (cellY < low) {
          this._points.remove(present);
          return false;
        }
        return true;  // keep around for now
      });
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
    const treeCount = 6;
    const type = ~~((0.5 + this._noise(x / 1.00124, y / 0.1241)) * treeCount);
    if (type < 0) {
      return 0;
    } else if (type >= treeCount) {
      return treeCount - 1;
    } else {
      return type;
    }
  }

  /**
   * Returns the collidable trees near the player position.
   *
   * @param {vec.Vector} at
   * @return {!Array<{x: number, y: number}>}
   */
  treesNear(at) {
    const x = Math.round(at.x / this._dim);
    const y = Math.round(at.y / this._dim);
    const out = [];

    for (let i = -1; i < 2; ++i) {
      for (let j = -1; j < 2; ++j) {
        const at = this._treeForCell(x + i, y + j);
        at && out.push(at);
      }
    }

    return out;
  }

  presentsNear(at) {
    return this._presents.filter((present) => {
      if (present.collected) {
        return false;
      }

      const p = {x: -present.position.z, y: present.position.x};
      const dist = vec.dist(at, p);
      if (dist < crashThreshold * 2) {
        return true;
      }
      return false;
    });
  }

  _treeForCell(x, y) {
    const ay = y;
    y -= Math.floor(treeStartAtY / this._dim);

    if (y < 0) {
      // no trees at top
      return null;
    }

    let v = this._noise(x / 3.27, y / 8.742);
    if (y < 5) {
      // slowly fade trees in
      v -= (5 - y) * 0.1;
    }

    if (v <= -y * 0.001 && v > -0.5) {  // get harder over time
      return null;
    }

    const offX = 2 * this._noise(x / 4.1222, y / 8.2421);
    const offY = 2 * this._noise(x / 1.21, y / 2.31);
    return {
      x: this._dim * (x + 0.5 + offX),
      y: this._dim * (ay + 0.5 + offY),  // use "actual y"
    };
  }

  _presentForCell(x, y) {
    if (y < Math.floor(treeStartAtY / this._dim) * 2) {
      // no presents at top
      return null;
    }

    const v = this._noise(x / 12.24, y / 13.531);
    if (v < 0.0 || v > 0.12) {
      return null;
    }

    const offX = 2 * this._noise(x / 3.1051, y / 3.951);
    const offY = 2 * this._noise(x / 6.71, y / 152.1535);
    return {
      x: this._dim * (x + 0.5 + offX),
      y: this._dim * (y + 0.5 + offY),
    };

  }

  tick(delta) {
    this._prensets = this._presents.filter((present) => {
      if (present.tick(delta)) {
        return true;
      }
      this._points.remove(present);
      return false;
    });
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {!Array<number>} alloc
   */
  _decorate(x, y, alloc) {
    const at = this._treeForCell(x, y);
    if (at) {
      const type = this._treeType(x, y);
      const id = this._points.alloc(at.x, at.y, type);
      alloc.push(id);
    }


    const presentAt = this._presentForCell(x, y);
    if (presentAt) {
      const p = new Present();
      p.position.set(presentAt.y, 0, -presentAt.x);
      this._points.add(p);

      this._presents.push(p);
      this._presentCellY.set(p, y);
    }
  }
}
