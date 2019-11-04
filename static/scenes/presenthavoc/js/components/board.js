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

  updateEntityPosition(entity, oldX, oldY, newX, newY, width = 1, height = 1) {
    if (Math.round(oldX) != Math.round(newX) ||
        Math.round(oldY) != Math.round(newY)) {
      this.removeEntityFromBoard(entity, oldX, oldY, width, height)
      this.addEntityToBoard(entity, newX, newY, width, height)
    }
  }

  addEntityToBoard(entity, x, y, width = 1, height = 1) {
    const roundedX = Math.round(x)
    const roundedY = Math.round(y)
    for (let i = roundedX; i < roundedX + width; i++) {
      for (let j = roundedY; j < roundedY + height; j++) {
        this.cells[i][j].push(entity)
      }
    }

    // console.log(this.cells)
  }

  removeEntityFromBoard(entity, x, y, width = 1, height = 1) {
    const roundedX = Math.round(x)
    const roundedY = Math.round(y)
    for (let i = roundedX; i < roundedX + width; i++) {
      for (let j = roundedY; j < roundedY + height; j++) {
        let index = this.cells[i][j].indexOf(entity)
        if (index > -1) {
          this.cells[i][j].splice(index, 1)
        }
      }
    }

    // console.log(this.cells)
  }

  getEntitiesAtPosition(x, y) {
    const roundedX = Math.round(x)
    const roundedY = Math.round(y)
    return this.cells[roundedX][roundedY]
  }
}