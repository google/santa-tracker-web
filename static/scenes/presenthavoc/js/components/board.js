goog.provide('app.Board')

goog.require('Constants')

app.Board = class Board {
  constructor(context) {
    // set size with config values in Constants
    // keep track of items in each grid position
    this.context = context
    this.context.style.height = Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.HEIGHT
    this.context.style.width = Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.WIDTH
    this.cells = [...Array(Constants.GRID_DIMENSIONS.WIDTH)].map(e => Array(Constants.GRID_DIMENSIONS.HEIGHT))

    console.log(this.cells)
  }

  positionOnBoard(entity, x, y) {
    // update entity in matrix, return transform pixel values
    // center point?

    return {
      x: x * Constants.GRID_DIMENSIONS.UNIT_SIZE + Constants.GRID_DIMENSIONS.UNIT_SIZE / 2,
      y: y * Constants.GRID_DIMENSIONS.UNIT_SIZE + Constants.GRID_DIMENSIONS.UNIT_SIZE / 2
    }
  }

  getEntitiesAtPosition(row, col) {

  }
}