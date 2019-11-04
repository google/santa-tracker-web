goog.provide('app.Board')

goog.require('Constants')

app.Board = class Board {
  constructor(context) {
    // set size with config values in Constants
    // keep track of items in each grid position
    // scale to stay contained in viewport
    this.context = context
    this.context.style.height = `${Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.HEIGHT}px`
    this.context.style.width = `${Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.WIDTH}px`
    this.cells = [...Array(Constants.GRID_DIMENSIONS.WIDTH)].map(
        e => [...Array(Constants.GRID_DIMENSIONS.HEIGHT)].map(
            el => []))

    console.log(this.cells)
  }

  updateEntityPosition(entity, oldX, oldY, newX, newY, width, height) {
    // TODO: calculate difference? instead of adding/removing entire area
    this.removeEntityFromBoard(entity, oldX, oldY, width, height)
    this.addEntityToBoard(entity, newX, newY, width, height)

    // Return the top left point
    return {
      x: newX * Constants.GRID_DIMENSIONS.UNIT_SIZE,
      y: newY * Constants.GRID_DIMENSIONS.UNIT_SIZE
    }
  }

  addEntityToBoard(entity, x, y, width, height) {
    for (let i = x; i < x + width; i++) {
      for (let j=y; j < y + height; j++) {
        this.cells[i][j].push(entity)
      }
    }
  }

  removeEntityFromBoard(entity, x, y, width, height) {
    for (let i = x; i < x + width; i++) {
      for (let j=y; j < y + height; j++) {
        let index = this.cells[i][j].indexOf(entity)
        if (index > -1) {
          this.cells[i][j].splice(index, 1)
        }
      }
    }
  }

  getEntitiesAtPosition(x, y) {
    return this.cells[x][y]
  }
}