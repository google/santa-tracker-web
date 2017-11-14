import { Entity } from '../../engine/core/entity.js';
import { Allocatable } from '../../engine/utils/allocatable.js';
import { randomValue } from '../../engine/utils/function.js';
import { Contents } from '../components/contents.js';
import { Arrival } from '../components/arrival.js';
import { Presence } from '../components/presence.js';

const {
  Object3D,
  Mesh,
  Texture,
  BufferGeometry,
  MeshBasicMaterial,
  BufferAttribute
} = self.THREE;


const geometry = new BufferGeometry();

// NOTE(cdata): Copied these out of Blender because I was struggling to do the
// UV mapping by hand. Should be doable though Maybe try again eventually, or
// never.
const normals = new BufferAttribute(new Float32Array([
  -1,0,-0,-1,0,-0,-1,0,-0,0,-0.0,-1,0,-0.0,-1,0,-0.0,-1,1,-0,0,1,-0,0,1,-0,0,0,0.0,1,0,0.0,1,0,0.0,1,0,-1,0.0,0,-1,0.0,0,-1,0.0,0,1,-0.0,0,1,-0.0,0,1,-0.0,-1,0,0,-0,-0.0,-1,1,0,0,-0,0.0,1,0,-1,0.0,0,1,-0.0
]), 3);

const uvs = new BufferAttribute(new Float32Array([
  0.0,0.0,0.5,0.5,0.0,0.5,0,0,0.5,0.5,0,0.5,0.5,0.5,0,0,0.5,0,0.5,0.5,0,0,0.5,0,0,1,0.5,0.5,0.5,1,0,1,0.5,0.5,0.5,1,0.5,0.0,0.5,0,0,0.5,0,0.5,0,0.5,0,0.5
]), 2);

const positions = new BufferAttribute(new Float32Array([
  -0.5,0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,0.5,0.5,0.5,0.5,-0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,0.5,0.5,0.5,-0.5,0.5,0.5,0.5,-0.5,0.5,-0.5,0.5,0.5
]), 3);

const indices = new BufferAttribute(new Uint16Array([
  0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,0,18,1,3,19,4,6,20,7,9,21,10,12,22,13,15,23,16
]), 1);

geometry.addAttribute('position', positions);
geometry.addAttribute('uv', uvs);
geometry.addAttribute('normal', normals);
geometry.setIndex(indices);

export const colorCombos = {
  yellowRed: ['#FADE4B', '#BE584A'],
  redYellow: ['#BE584A', '#FADE4B'],
  orangeBlue: ['#E68F49', '#4EB3EC'],
  yellowBlue: ['#FADF4B', '#4EB3EC'],
  purpleGreen: ['#87488F', '#67B783'],
  purpleYellow: ['#87488F', '#FADF4B'],
  bluePurple: ['#4EB3EA', '#87488F']
};

const generateDropTexture = (() => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const TWO_PI = Math.PI * 2.0;
  const cache = {};

  canvas.width = canvas.height = 128;

  return (majorColor, minorColor) => {
    const cacheKey = `${majorColor}_${minorColor}`;

    if (cache[cacheKey] != null) {
      return cache[cacheKey];
    }

    context.fillStyle = majorColor;
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = minorColor;
    context.fillRect(24, 0, 16, 128);
    context.fillRect(0, 24, 128, 16);

    const image = document.createElement('img');
    image.src = canvas.toDataURL();
    cache[cacheKey] = image;
    return image;
  };
})();

export class Drop extends Allocatable(Entity(Object3D)) {
  constructor() {
    super();
    const model = new Mesh(
        geometry, new MeshBasicMaterial({ map: new Texture() }));
    model.rotation.x = Math.PI / 2.5;

    this.add(model);
    this.model = model;
  }

  onAllocated(colorCombo = randomValue(colorCombos)) {
    this.model.scale.set(
        Math.random() * 5 + 10,
        Math.random() * 5 + 10,
        Math.random() * 4 + 8);
    this.model.material.map.image = generateDropTexture(...colorCombo);
    this.model.material.map.needsUpdate = true;

    this.arrival = new Arrival();
    this.contents = new Contents();
    this.presence = new Presence();
  }

  setup(game) {
    const { mapSystem } = game;
    const { grid } = mapSystem;

    this.model.position.z = grid.cellSize / 2.0;
  }

  update(game) {
    const { presence } = this;

    if (!presence.exiting) {
      this.model.rotation.y += 0.01;
    } else {
      this.model.rotation.y = 0;
      this.model.rotation.x = Math.PI / 2.0;
    }
  }
};
