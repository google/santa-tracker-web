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

import * as vec from '../vec.js';

const lineSegments = 80;
const lineDistance = 5;

export class SkiTrail extends THREE.Object3D {
  constructor(start) {
    super();

    this._geometry = new THREE.Geometry();
    for (let i = 0; i < lineSegments; ++i) {
      this._geometry.vertices.push(this._vecFor(start));
    }

    this._last = start;

    // create lower line

    this._line = new MeshLine();
    this._line.setGeometry(this._geometry);

    const material = new MeshLineMaterial({
      lineWidth: 0.015,
      color: new THREE.Color(0xcccccc),
      sizeAttenuation: 1,
    });

    const mesh = new THREE.Mesh(this._line.geometry, material);
    mesh.frustumCulled = false;  // always show
    mesh.position.x = -10;
    this.add(mesh);

    // create top line

    this._topLine = new MeshLine();
    this._topLine.setGeometry(this._geometry);

    const topMaterial = new MeshLineMaterial({
      lineWidth: 0.01,
      color: new THREE.Color(0xffffff),
      sizeAttenuation: 1,
    });

    const topMesh = new THREE.Mesh(this._topLine.geometry, topMaterial);
    topMesh.frustumCulled = false;  // always show
    topMesh.position.y = 6;
    this.add(topMesh);

    this._widthFunc = this._widthFunc.bind(this);
  }

  _widthFunc(point) {
    const v = Math.sin(point * Math.PI / 2);

    if (point * Math.PI > 2) {
      const vmax = Math.cos(point * Math.PI + 4);
      return Math.min(v, vmax);
    }

    return v;
  }

  /**
   * @param {vec.Vector} position
   */
  push(position) {
    const v = this._geometry.vertices;

    const dist = vec.dist(this._last, position);
    if (dist === 0) {
      return;  // actually no change
    } else if (dist < lineDistance) {
      // replace last point
      v[v.length - 1] = this._vecFor(position);
    } else {
      // add/remove points
      v.push(this._vecFor(position));
      v.shift();
      this._last = {x: position.x, y: position.y};
    }

    this._line.setGeometry(this._geometry, this._widthFunc);
    this._topLine.setGeometry(this._geometry, this._widthFunc);
  }

  _vecFor(p) {
    return new THREE.Vector3(p.y, 16, -p.x)
  }
}