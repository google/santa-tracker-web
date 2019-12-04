goog.provide('app.Board')

goog.require('Constants')

class Board {
  constructor() {
    this.height = Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.HEIGHT
    this.width = Constants.GRID_DIMENSIONS.UNIT_SIZE * Constants.GRID_DIMENSIONS.WIDTH
    this.ratio = Constants.GRID_DIMENSIONS.WIDTH / Constants.GRID_DIMENSIONS.HEIGHT
    this.cells = [...Array(Constants.GRID_DIMENSIONS.WIDTH)].map(
        e => [...Array(Constants.GRID_DIMENSIONS.HEIGHT)].map(
            el => []))
  }

  init(context) {
    this.context = context
    this.context.style.height = `${this.height}px`
    this.context.style.width = `${this.width}px`

    if (Constants.DEBUG) {
      this.initDebugView()
    }

    this.onResize()
    window.addEventListener('resize', this.onResize.bind(this))
  }

  reset() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        this.cells[i][j] = []
      }
    }
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

  initDebugView() {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        let debugCell = document.createElement('div')
        debugCell.setAttribute('class', 'debug-cell')
        debugCell.style.transform = `translate(${i * Constants.GRID_DIMENSIONS.UNIT_SIZE}px, ${j * Constants.GRID_DIMENSIONS.UNIT_SIZE}px)`
        this.context.append(debugCell)
      }
    }
  }

  updateDebugCell(x, y) {
    if (!Constants.DEBUG) {
      return
    }

    const index = x * Constants.GRID_DIMENSIONS.HEIGHT + y
    const debugCell = this.context.getElementsByClassName('debug-cell')[index]
    let names = ''
    for (const entity of this.cells[x][y]) {
      names += ' ' + entity.elem.classList
    }
    debugCell.textContent = names
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
        this.updateDebugCell(i, j)
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
          this.updateDebugCell(i, j)
        }
      }
    }

    // console.log(this.cells)
  }

  getSurroundingEntities(player) {
    const { x, y } = player.position
    const roundedX = Math.round(x)
    const roundedY = Math.round(y)

    const playerCell = this.cells[roundedX][roundedY]

    // surrounding cells
    const surroundingEntities = []

    for (let i = roundedX - 1; i <= roundedX + 1; i++) {
      for (let j = roundedY - 1; j <= roundedY + 1; j++) {
        // get available cells only
        if (this.cells[i] && this.cells[i][j]) {
          const cell = this.cells[i][j]
          if (cell === playerCell) {
            // if in same cell as player
            for (let k = 0; k < cell.length; k++) {
              const entity = cell[k]
              // get only entities that trigger an action on the player cell
              if (entity.config.checkCell && entity.id !== player.id) {
                surroundingEntities.push(entity)
              }
            }
          } else {
            // if around player cell
            for (let k = 0; k < cell.length; k++) {
              const entity = cell[k]
              // get only entities that trigger an action around the player cell
              if (entity.config.checkBorder && entity.id !== player.id) {
                surroundingEntities.push(entity)
              }
            }
          }
        }
      }
    }

    return surroundingEntities
  }
}

app.Board = new Board()