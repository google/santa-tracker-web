import { MagicHexGrid } from '../utils/magic-hex-grid.js';
import { HexMap } from '../entities/hex-map.js';
import { Obstacles } from '../entities/obstacles.js';
import { Map } from '../components/map.js';
import { Tree } from '../entities/static/tree.js';

const { Object3D } = self.THREE;

export class MapSystem {
  constructor(unitWidth = 32, unitHeight = 32, tileScale = 32) {
    this.grid = new MagicHexGrid(unitWidth, unitHeight, tileScale);

    this.map = new Map(this.grid);

    this.mapLayer = new Object3D();
    this.hexMap = new HexMap();
    this.obstacles = new Obstacles();

    const gimbal = new Object3D();

    gimbal.rotation.x = 4 * Math.PI / 5;
    gimbal.add(this.hexMap);
    gimbal.add(this.obstacles);

    this.mapLayer.add(gimbal);

    this.gimbal = gimbal;
    this.mapLayer.add(gimbal);

    this.pickHandlers = [];
  }

  handleMapPick(handler) {
    this.pickHandlers.push(handler);

    return () => {
      const index = this.pickHandlers.indexOf(handler);
      this.pickHandlers.splice(index, 1);
    };
  }

  onMapPicked(event) {
    const hit = event.detail.hits.get(this.hexMap.inputSurface)[0];
    const index = this.grid.hitToIndex(hit);
    const position = this.grid.hitToPosition(hit);
    const pickEvent = { index, position };

    console.log(event, pickEvent);
    this.pickHandlers.forEach(handler => {
      handler(pickEvent);
    });
  }

  setup(game) {
    this.obstacles.setup(game);
    this.hexMap.setup(game);

    this.hexMap.handlePick(event => this.onMapPicked(event));

    this.map.tileObstacles.array.forEach((obstacle, index) => {
      if (obstacle < 0) {
        return;
      }

      const position = this.grid.indexToPosition(index);
      position.y -= this.grid.cellSize / 2.0;
      const tree = new Tree(index, position);

      tree.setup(game);

      game.collisionSystem.addCollidable(tree);
    });
  }

  update(game) {
    this.obstacles.update(game);
    this.hexMap.update(game);
    //this.mapLayer.rotation.y += 0.01;
  }
};
