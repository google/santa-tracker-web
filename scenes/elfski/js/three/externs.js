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

/**
 * @fileoverview Simple externs for THREE.JS. Not even vaguely exhaustive.
 * @externs
 */

var THREE = {};

/**
 * @constructor
 * @param {number=} x
 * @param {number=} y
 * @param {number=} z
 */
THREE.Vector3 = function(x, y, z) {};

/**
 * @type {number}
 */
THREE.Vector3.prototype.x;

/**
 * @type {number}
 */
THREE.Vector3.prototype.y;

/**
 * @type {number}
 */
THREE.Vector3.prototype.z;

/**
 * @constructor
 */
THREE.Object3D = function() {};

/**
 * @type {!THREE.Vector3}
 */
THREE.Object3D.prototype.position;

/**
 * @param {!THREE.Object3D} object
 * @param {...!THREE.Object3D} var_args
 */
THREE.Object3D.prototype.add = function(object, var_args) {};

/**
 * @constructor
 * @extends {THREE.Object3D}
 */
THREE.Scene = function() {};

/**
 * @constructor
 * @param {!Object<string, *>=} parameters
 */
THREE.WebGLRenderer = function(parameters) {};

/**
 * @param {number} value
 */
THREE.WebGLRenderer.prototype.setPixelRatio = function(value) {};

/**
 * @param {number} width
 * @param {number} height
 * @param {boolean=} updateStyle
 */
THREE.WebGLRenderer.prototype.setSize = function(width, height, updateStyle) {};

/**
 * @constructor
 * @extends {THREE.Object3D}
 */
THREE.Camera = function() {};

/**
 * @constructor
 * @extends {THREE.Camera}
 * @param {number} fov
 * @param {number} aspect
 * @param {number} near
 * @param {number} far
 */
THREE.PerspectiveCamera = function(fov, aspect, near, far) {};

/**
 * @constructor
 * @extends {THREE.Camera}
 * @param {number} left
 * @param {number} right
 * @param {number} top
 * @param {number} bottom
 * @param {number} near
 * @param {number} far
 */
THREE.OrthographicCamera = function(left, right, top, bottom, near, far) {};
