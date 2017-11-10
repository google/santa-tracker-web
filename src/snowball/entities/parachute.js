import { Entity } from '../../engine/core/entity.js';
import { Allocatable } from '../../engine/utils/allocatable.js';
import { parachute } from '../textures.js';

const {
  Object3D,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial
} = self.THREE;

export class Parachute extends Allocatable(Entity(Object3D)) {
  constructor() {
    super();

    const size = 64;
    const geometry = new PlaneBufferGeometry(size, size);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      map: parachute
    });
    const dolly = new Object3D();

    dolly.position.z = -size - 20.0; // NOTE(cdata): Magic number here..
    this.add(dolly);
    this.dolly = dolly;

    const graphic = new Mesh(geometry, material);

    graphic.rotation.x += Math.PI / 6;
    this.add(graphic);
    this.graphic = graphic;

    this.size = size;
  }

  onFreed() {
    this.dolly.remove(this.carriedObject);
    this.carriedObject = null;
  }

  carry(object) {
    //object.position.z = -this.size - 8.0;
    this.carriedObject = object;
    this.dolly.add(object);
  }
}
