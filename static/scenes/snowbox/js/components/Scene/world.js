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

import CONFIG from './config.js'

const world = new CANNON.World()
world.gravity.set(0, -9.8, 0)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10 // Increase solver iterations (default is 10)
// world.solver.tolerance = 0 // Force solver to use all iterations
world.defaultContactMaterial.friction = 1
world.defaultContactMaterial.restitution = 0.05

const iceMaterial = new CANNON.Material('iceMaterial')
// iceMaterial.friction = 1000
// iceMaterial.restitution = 0

// const iceContactMaterial = new CANNON.ContactMaterial(iceMaterial, iceMaterial, {
//   friction: 0.1,
//   restitution: 0,
//   contactEquationRelaxation: 10.0,
//   frictionEquationStiffness: 1e8
// })
// world.addContactMaterial(iceContactMaterial)

export { world, iceMaterial }

