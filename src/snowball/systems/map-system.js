import { MagicHexGrid } from '../utils/magic-hex-grid.js';
import { HexMap } from '../entities/hex-map.js';
import { Obstacles } from '../entities/obstacles.js';
import { Map } from '../components/map.js';
import { Tree } from '../entities/static/tree.js';
import { DestinationMarker } from '../entities/destination-marker.js';

const { Object3D } = self.THREE;

const destinationMarker = new DestinationMarker();

export class MapSystem {
  constructor(unitWidth = 32, unitHeight = 32, tileScale = 32) {
    this.grid = new MagicHexGrid(unitWidth, unitHeight, tileScale);

    this.pendingMapSeed = undefined;
    this.map = null;

    this.mapLayer = new Object3D();
    this.hexMap = new HexMap();
    this.obstacles = new Obstacles();
    this.obstacleCollidables = new Set();
    this.destinationMarker = new DestinationMarker();

    const gimbal = new Object3D();

    gimbal.rotation.x = 4 * Math.PI / 5;
    gimbal.add(this.hexMap);
    gimbal.add(this.obstacles);
    gimbal.add(this.destinationMarker);

    this.mapLayer.add(gimbal);

    this.gimbal = gimbal;
    this.mapLayer.add(gimbal);

    this.pickHandlers = [];
  }

  regenerateMapWithSeed(seed) {
    this.pendingMapSeed = seed;
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

    this.pickHandlers.forEach(handler => {
      handler(pickEvent);
    });
  }

  setup(game) {
    this.obstacles.setup(game);
    this.destinationMarker.setup(game);
    this.hexMap.setup(game);

    this.hexMap.handlePick(event => this.onMapPicked(event));
  }

  update(game) {
    const { clientSystem } = game;
    const { player: clientPlayer } = clientSystem;

    if (this.pendingMapSeed != null) {
      this.rebuildMap(game, this.pendingMapSeed);
      this.pendingMapSeed = undefined;
    }

    this.obstacles.update(game);
    this.hexMap.update(game);

    if (!clientPlayer) {
      return;
    }
    const destinationReached = clientPlayer.path.destinationReached;

    if (destinationReached && this.destinationMarker.visible) {
      this.destinationMarker.visible = false;
    } else if (!destinationReached) {
      this.destinationMarker.position.x = clientPlayer.path.destination.x;
      this.destinationMarker.position.y = clientPlayer.path.destination.y - 20.0;

      this.destinationMarker.visible = true;
    }
  }

  rebuildMap(game, seed) {
    this.obstacleCollidables.forEach((tree) => {
      game.collisionSystem.removeCollidable(tree);
    });

    this.map = new Map(this.grid, seed);
    this.hexMap.map = this.map;
    this.obstacles.map = this.map;

    this.obstacleCollidables = new Set();
    this.map.tileObstacles.array.forEach((obstacle, index) => {
      if (obstacle < 0) {
        return;
      }

      const position = this.grid.indexToPosition(index);
      position.y -= this.grid.cellSize / 2.0;
      const tree = new Tree(index, position);

      tree.setup(game);

      game.collisionSystem.addCollidable(tree);
      this.obstacleCollidables.add(tree);
    });
  }
};
