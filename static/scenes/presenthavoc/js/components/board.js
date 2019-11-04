goog.provide('app.Board')

goog.require('Constants')

app.Board = class Board {
  constructor(context) {
    this.context = context
    this.height = Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.HEIGHT
    this.width = Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.WIDTH
    this.ratio = Constants.GRID_DIMENSIONS.WIDTH / Constants.GRID_DIMENSIONS.HEIGHT
    this.context.style.height = `${this.height}px`
    this.context.style.width = `${this.width}px`
    this.cells = [...Array(Constants.GRID_DIMENSIONS.WIDTH)].map(
        e => [...Array(Constants.GRID_DIMENSIONS.HEIGHT)].map(
            el => []))

    this.onResize()
    window.addEventListener('resize', this.onResize.bind(this))
  }

  onResize() {
    let container = document.getElementById('main')
    if (container) {
      let containerRatio = container.offsetWidth / container.offsetHeight
      if (containerRatio < this.ratio) {
        // top bottom letterboxing
        this.context.style.left = '0'
        this.context.style.top = '50%'
        this.context.style.transform = `scale(${container.offsetWidth / this.width}) translateY(-50%)`
      } else {
        // left right letterboxing
        this.context.style.left = '50%'
        this.context.style.top = '0'
        this.context.style.transform = `scale(${container.offsetHeight / this.height}) translateX(-50%)`
      }
    }
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