import { Entity } from '../../engine/core/entity.js';
import { Allocatable } from '../../engine/utils/allocatable.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { createElf } from '../models.js';
import { LodSystem } from '../systems/lod-system.js';

const {
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Object3D,
  GLTFLoader,
  AnimationMixer,
  Vector2
} = self.THREE;

const intermediateVector2 = new Vector2();
const PI_OVER_TWO = Math.PI / 2.0;
const PI_OVER_TWO_POINT_TWO_FIVE = Math.PI / 2.25;

export class Elf extends Allocatable(Entity(Object3D)) {
  constructor() {
    super();

    this.modelInitialized = false;

    // The hit target is the object in the scene graph that will be used
    // to detect input events.
    const hitTarget = new Mesh(
      new PlaneBufferGeometry(72, 72),
      new MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.5,
        visible: false,
        side: 2,
        transparent: true,
        wireframe: false
      }));

    hitTarget.position.z = 12;
    this.add(hitTarget);
    this.hitTarget = hitTarget;

    const dolly = new Object3D();

    this.add(dolly);
    this.dolly = dolly;
    this.path = null;
    this.lod = LodSystem.lod.LOW;

    this.collider = Rectangle.allocate(15, 45, this.position);
  }

  onAllocated(playerId) {
    this.playerId = playerId;

    this.dolly.rotation.x = PI_OVER_TWO_POINT_TWO_FIVE;
    this.dolly.position.z = 19;
    this.dolly.position.y = -10.0;

    this.path = null;
  }

  setup(game) {
    const { lodSystem, inputSystem, clientSystem, collisionSystem } = game;
    const { player: clientPlayer } = clientSystem;

    lodSystem.addEntity(this);
    collisionSystem.addCollidable(this);

    if (this !== clientPlayer) {
      this.unsubscribe = inputSystem.on('pick', event => {
        clientSystem.assignTarget(this);
        return false;
      }, this.hitTarget);
    }
  }

  teardown(game) {
    const { collisionSystem, lodSystem } = game;

    lodSystem.removeEntity(this);
    collisionSystem.removeCollidable(this);

    if (this.unsubscribe != null) {
      this.unsubscribe();
    }
  }

  set lod(value) {
    if (value != this.currentLod) {
      this.currentLod = value;
      this.lodNeedsUpdate = true;
    }
  }

  initializeModel() {
    if (!this.modelInitialized) {
      console.count('Elf model initialized');
      createElf().then(model => {
        const elf = model.object.children[0];

        elf.scale.multiplyScalar(5.0);

        this.model = model;
        this.dolly.add(elf);
      });
    }

    this.modelInitialized = true;
  }

  face(angle) {
    this.dolly.rotation.y = angle;
  }

  followPath(path) {
    this.path = path;
  }

  idle() {
    if (this.model != null) {
      this.model.play('elf_rig_idle');
    }
  }

  run() {
    if (this.model != null) {
      this.model.play('elf_rig_run');
    }
  }

  update(game) {
    if (this.lodNeedsUpdate) {
      if (this.currentLod === LodSystem.lod.HIGH) {
        this.initializeModel();
        this.visible = true;
      } else {
        this.visible = false;
      }

      this.lodNeedsUpdate = false;
    }

    if (this.path != null) {
      const nextWaypoint = this.path[0];
      const delta = intermediateVector2;
      delta.subVectors(nextWaypoint, this.position);
      const length = delta.length();
      delta.normalize();
      delta.multiplyScalar(2.25);
      const lengthNormalized = delta.length();

      if (length <= lengthNormalized) {
        this.position.x = nextWaypoint.x;
        this.position.y = nextWaypoint.y;
        this.path.shift();
      } else {
        this.position.x += delta.x;
        this.position.y += delta.y;
      }

      this.face(Math.atan2(delta.y, delta.x) + PI_OVER_TWO);
      this.run();
    } else {
      this.idle();
    }

    if (this.path != null && this.path.length === 0) {
      this.path = null;
    }

    if (this.model != null) {
      this.model.update(game);
    }
  }
};
