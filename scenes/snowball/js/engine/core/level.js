import { Entity } from './entity.js';

const {
  Scene
} = self.THREE;

/**
 * @constructor
 * @extends {THREE.Scene}
 * @implements {Entity}
 */
const EntityScene = Entity(Scene);


export class Level extends EntityScene {
  measure(game) {}
};
