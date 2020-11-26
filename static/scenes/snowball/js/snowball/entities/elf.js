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

import {Entity} from '../../engine/core/entity.js';
import {Allocatable} from '../../engine/utils/allocatable.js';
import {Rectangle} from '../../engine/utils/collision-2d.js';
import {combine, randomElement} from '../../engine/utils/function.js';
import {Arrival} from '../components/arrival.js';
import {Health} from '../components/health.js';
import {Path} from '../components/path.js';
import {Powerups} from '../components/powerup.js';
import {Presence} from '../components/presence.js';
import {Speed} from '../components/speed.js';
import {Visibility} from '../components/visibility.js';
import {createElf} from '../models.js';
import {lod} from '../systems/lod-system.js';

import {PlayerMarker} from './player-marker.js';
import {Snowball} from './snowball.js';

const {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Object3D,
  Vector2,
} = self.THREE;

const intermediateVector2 = new Vector2();
const PI_OVER_TWO = Math.PI / 2.0;
const PI_OVER_TWO_POINT_TWO_FIVE = Math.PI / 2.25;

const majorColors = [
  '#84488F',
  '#D55040',
  '#4DB1E9',
  '#55AB57',
  '#56BBCA',
  '#BC3EB4',
];

const minorColors = ['#E7C241', '#936644', '#B8906D', '#DBBC99'];

const hairColors = ['#2F3030', '#7C4149', '#AB2923', '#EA9639'];

const generateElfTexture = (() => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const TWO_PI = Math.PI * 2.0;
  const cache = {};

  canvas.width = canvas.height = 512;

  return (majorColor, minorColor, hairColor = '#fff', ponytail = true) => {
    const cacheKey = `${majorColor}_${minorColor}`;

    if (cache[cacheKey] != null) {
      return cache[cacheKey];
    }

    // Start coloring at 128 if ponytail should be transparent:
    const hairColorPosition = ponytail ? 0 : 128;

    context.clearRect(0, 0, hairColorPosition, 153);

    // Hair...
    context.fillStyle = hairColor;
    context.fillRect(hairColorPosition, 0, 256 - hairColorPosition, 153);

    // Socks / hat...
    context.fillStyle = '#fff';
    context.fillRect(256, 0, 256, 153);

    // Skin...
    context.fillStyle = minorColor;
    context.fillRect(0, 153, 512, 174);

    // Clothes...
    context.fillStyle = majorColor;
    context.fillRect(0, 327, 512, 140);

    // Belt / boots...
    context.fillStyle = '#333';
    context.fillRect(0, 467, 512, 45);

    // Eyes..
    // NOTE(cdata): IE11 does not support
    // CanvasRenderingContext2D.prototype.ellipse
    context.arc(44, 207, 21, 0, TWO_PI);
    context.arc(150, 207, 21, 0, TWO_PI);
    context.fill();

    // Buckle...
    context.fillStyle = '#F9D448';
    context.fillRect(252, 460, 60, 52);

    const image = document.createElement('img');
    image.src = canvas.toDataURL();
    cache[cacheKey] = image;
    return image;
  };
})();

const clientPlayerMarker = new PlayerMarker();

/**
 * @constructor
 * @extends {THREE.Object3D}
 * @implements {EntityInterface}
 */
const EntityObject3D = Entity(Object3D);

/**
 * @constructor
 * @extends {EntityObject3D}
 * @implements {AllocatableInterface}
 */
const AllocatableEntityObject3D = Allocatable(EntityObject3D);

export class Elf extends AllocatableEntityObject3D {
  static fromJson(json) {
    const elf = Elf.allocate(json.id, json.arrival.tileIndex);

    elf.position.copy(json.position);

    Object.assign(elf.health, json.health);
    Object.assign(elf.arrival, json.arrival);
    Object.assign(elf.presence, json.presence);

    elf.powerups.copyFromJson(json.powerups);

    return elf;
  }

  randomizeColors() {
    const material = this.elf.children[1].material;
    material.map.image = generateElfTexture(randomElement(majorColors), randomElement(minorColors));
    material.map.needsUpdate = true;
  }

  ensureCorrectTextureImage() {
    if (this.elf != null) {
      this.elf.children[1].material.map.image = this.textureImage;
      this.elf.children[1].material.map.needsUpdate = true;
      this.elf.children[1].material.needsUpdate = true;
    }
  }

  clone() {
    return Elf.allocate(this.playerId, this.majorColor, this.minorColor, this.gender);
  }

  constructor() {
    super();

    this.modelInitialized = false;

    // The hit target is the object in the scene graph that will be used
    // to detect input events.
    const hitTarget = new Mesh(new PlaneBufferGeometry(100, 100), new MeshBasicMaterial({
                                 color: 0xff0000,
                                 opacity: 0.5,
                                 visible: false,
                                 side: 2,
                                 transparent: true,
                                 wireframe: false
                               }));

    this.add(hitTarget);
    this.hitTarget = hitTarget;

    const dolly = new Object3D();

    this.add(dolly);
    this.dolly = dolly;
    this.path = null;
    this.lod = lod.LOW;

    this.collider = Rectangle.allocate(15, 45, this.position);
  }

  onAllocated(
      playerId, startingTileIndex, majorColor = randomElement(majorColors),
      minorColor = randomElement(minorColors), hairColor = randomElement(hairColors),
      ponytail = !!Math.round(Math.random())) {
    this.playerId = playerId;

    this.majorColor = majorColor;
    this.minorColor = minorColor;
    this.textureImage = generateElfTexture(majorColor, minorColor, hairColor, ponytail);

    this.dolly.rotation.x = PI_OVER_TWO_POINT_TWO_FIVE;
    this.dolly.position.z = 19;
    this.dolly.position.y = -10.0;

    this.hasAssignedTarget = false;

    this.path = new Path();
    this.health = new Health();
    this.arrival = new Arrival(startingTileIndex);
    this.presence = new Presence();
    this.powerups = new Powerups();
    this.visibility = new Visibility();
    this.speed = new Speed();
    this.sank = false;

    if (this.elf) {
      // This opacity may have changed depending on how the character departed
      // when it was last used:
      this.elf.children[1].material.opacity = 1.0;
    }
  }

  setup(game) {
    const {lodSystem, clientSystem, collisionSystem} = game;
    const {player: clientPlayer} = clientSystem;

    lodSystem.addEntity(this);
    collisionSystem.addCollidable(this);

    if (this === clientPlayer) {
      this.dolly.add(clientPlayerMarker);
      clientPlayerMarker.rotation.x = -PI_OVER_TWO;
    }

    this.ensureCorrectTextureImage();
  }

  teardown(game) {
    const {collisionSystem, lodSystem} = game;

    lodSystem.removeEntity(this);
    collisionSystem.removeCollidable(this);

    if (this.unsubscribe != null) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  update(game) {
    const {clientSystem, mapSystem, inputSystem, collisionSystem, entityRemovalSystem} = game;
    const {player: clientPlayer} = clientSystem;
    const {grid} = mapSystem;
    const {arrival, path, health} = this;
    const isClientPlayer = this === clientPlayer;

    if (isClientPlayer) {
      if (!arrival.arrived && clientPlayerMarker.visible) {
        clientPlayerMarker.visible = false;
      } else if (arrival.arrived && !clientPlayerMarker.visible) {
        clientPlayerMarker.visible = true;
      }
    }

    if (arrival.arrived && this.unsubscribe == null) {
      this.hitTarget.position.z = grid.cellSize / 4.0 + 2.0;
      // NOTE(cdata): Pick listening is deferred because reparenting
      // the player apparently messes up the octree hierarchy.
      this.unsubscribe = combine(inputSystem.on('pick', event => {
        if (!isClientPlayer) {
          clientSystem.assignTarget(this);
          return false;
        }
      }, this.hitTarget), collisionSystem.handleCollisions(this, (self, other) => {
        if (other instanceof Snowball && other.thrower !== this) {
          const {direction} = other.trajectory;

          this.face(Math.atan2(direction.y, direction.x) - PI_OVER_TWO);
          // TODO(cdata): This probably should be handled in the player
          // based on some state that says "this deadly thing collided
          // with me."
          this.die();
          entityRemovalSystem.teleportEntity(this);
        }
      }));
    }

    if (this.lodNeedsUpdate) {
      if (this.currentLod === lod.HIGH && health.alive) {
        this.initializeModel(game.assetBaseUrl);
        this.visible = true;
      } else {
        this.visible = false;
      }

      this.lodNeedsUpdate = false;
    }

    if (health.alive) {
      if (!path.destinationReached) {
        const {speed} = this;
        const nextWaypoint = path.nextWaypoint;
        const delta = intermediateVector2;
        delta.subVectors(nextWaypoint, this.position);
        const length = delta.length();
        delta.normalize();
        delta.multiplyScalar(2.25 * speed.scale);
        const lengthNormalized = delta.length();

        if (length <= lengthNormalized) {
          this.position.x = nextWaypoint.x;
          this.position.y = nextWaypoint.y;

          path.waypoints.shift();
        } else {
          this.position.x += delta.x;
          this.position.y += delta.y;
        }

        this.face(Math.atan2(delta.y, delta.x) + PI_OVER_TWO);
        this.run();
      } else {
        this.idle();
      }

      if (this.hasAssignedTarget) {
        this.throw();
        this.hasAssignedTarget = false;
      }
    } else {
      const {presence, visibility} = this;

      if (presence.exiting) {
        if (clientPlayerMarker.parent === this.dolly) {
          this.dolly.remove(clientPlayerMarker);
        }

        if (this.currentLod === lod.HIGH && this.elf != null) {
          const material = this.elf.children[1].material;
          material.opacity = visibility.opacity;
        }
      }

      collisionSystem.removeCollidable(this);
    }

    if (this.model != null) {
      this.model.update(game);
    }
  }

  set lod(value) {
    if (this.health && !this.health.alive) {
      return;
    }

    if (value != this.currentLod) {
      this.currentLod = value;
      this.lodNeedsUpdate = true;
    }
  }

  initializeModel(assetBaseUrl) {
    if (!this.modelInitialized) {
      console.count('Elf model initialized');

      createElf(assetBaseUrl).then(model => {
        const elf = model.object.children[0];
        const material = elf.children[1].material.clone();
        const map = material.map.clone();

        elf.children[1].material = material;
        material.map = map;

        material.transparent = true;

        elf.scale.multiplyScalar(5.0);

        this.elf = elf;
        this.model = model;
        this.dolly.add(elf);

        this.ensureCorrectTextureImage();
      });
    }

    this.modelInitialized = true;
  }

  face(angle) {
    this.dolly.rotation.y = angle;
  }

  idle() {
    if (this.model != null) {
      this.model.play('elf_rig_idle');
    }
  }

  run() {
    if (this.model != null) {
      this.model.play('elf_rig_running');
    }
  }

  throw() {
    if (this.model != null) {
      this.model.mixOnce('elf_rig_throw');
    }
  }

  fallDown() {
    if (this.model != null) {
      const fall = Math.floor(Math.random() * 3) + 1;
      this.model.playOnce(`elf_rig_fall_down_${fall}`);
      const handler = event => {
        const animation = this.model.play(`elf_rig_fall_down_${fall}_idle`)
        if (animation != null) {
          animation.fadeIn(0.5);
          this.model.animationMixer.removeEventListener('finished', handler);
        }
      };
      this.model.animationMixer.addEventListener('finished', handler);
    }
  }

  sink() {
    this.sank = true;
    this.die();
  }

  die() {
    this.health.alive = false;
    this.fallDown();
  }
};
