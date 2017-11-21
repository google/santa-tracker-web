import { HexCoord } from '../../engine/utils/hex-coord.js';
import { HexGrid } from '../../engine/utils/hex-grid.js';

const { Vector2, Vector3 } = self.THREE;

/**
 * Some of the scale computations are magic number-y right now because
 * I did the vertical scaling wrong somewhere. For now, the magic number
 * stuff is living in this special subclass ~ cdata@
 */
export class MagicHexGrid extends HexGrid {
  constructor(width, height, cellSize, angularScale = 0.8110396639) {
    super(width, height, cellSize);

    this.angularScale = angularScale;
    this.absoluteCellHeight = this.cellHeight * this.angularScale;

    this.absolutePixelHeight = this.height * this.absoluteCellHeight +
        this.absoluteCellHeight * 0.5;
  }

  hitToIndex(hit) {
    const uv = hit.uv;

    return this.uvToIndex(hit.uv);
  }

  hitToPosition(hit) {
    const uv = hit.uv;
    const width = this.pixelWidth;
    const height = this.pixelHeight;

    return new Vector2(uv.x * width - width / 2, uv.y * height - height / 2);
  }

  playerWaypointsForMap(player, destination, map) {
    const { index, position } = destination;

    const playerIndex = this.positionToIndex(player.position);

    const tileIsPassable = (grid, currentIndex) => {
      const state = map.getTileState(currentIndex);
      const sprite = map.getTileObstacle(currentIndex);

      return state > 0 && state < 3 && sprite < 0 && state !== 5.0;
    };

    const waypoints = this.waypoints(playerIndex, index, tileIsPassable);

    if (waypoints.length) {
      const path = waypoints.slice(1, waypoints.length - 1)
          .map(index => {
            //map.setTileState(index, 2.0);
            return this.indexToPosition(index)
          });

      path.push(position);
      return path;
    }

    return waypoints;
  }
};
