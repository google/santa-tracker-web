goog.provide('app.Fence')

goog.require('Constants')

goog.require('app.Entity')
goog.require('app.shared.pools')
goog.require('Utils')

app.Fence = class Fence extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    this.elem.setAttribute('class', 'fence')
    document.getElementById('fences').append(this.elem)
  }

  onInit(config) {
    const { cells, row, column } = config
    const cell = cells[row][column]
    const type = this.defineType(cells, row, column)

    if (cell.top) {
      this.addChild('top', type.top)
    }

    if (cell.right) {
      this.addChild('right', type.right)
    }

    if (cell.bottom) {
      this.addChild('bottom', type.bottom)
    }

    if (cell.left) {
      this.addChild('left', type.left)
    }

    super.onInit(config)

    this.config.checkCell = true
    this.config.checkBorder = true
  }

  addChild(side, type = false) {
    const div = document.createElement('div')
    div.classList.add('fence__background')
    div.classList.add(`fence__background--${side}`)
    if (type) {
      div.classList.add(`fence__background--${type}`)
    }
    this.elem.appendChild(div)
  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    let actions = []

    // if player is in the border, he is blocked
    this.blockingPosition = Utils.isInFence(this.config, player.position, player.prevPosition, this.elem)

    // if player is in the border, he is blocked
    if (this.blockingPosition) {
      actions = [Constants.PLAYER_ACTIONS.BLOCK]
    }

    return actions
  }

  defineType(cells, row, column) {
    const cell = cells[row][column]
    const type = {
      top: false,
      right: false,
      bottom: false,
      left: false,
    }

    // if previous
    // if previous is not top/bottom and this one has top/bottom, make it start
    if (cell.top || cell.bottom) {
      if (column === 0) {
        if (cell.top) {
          type.top = 'start'
        }
        if (cell.bottom) {
          type.bottom = 'start'
        }
      }
      if (cells[row][column - 1]) {
        if (!cells[row][column - 1].top && !cells[row][column - 1].bottom) {
          if (cell.top) {
            type.top = 'start'
          }
          if (cell.bottom) {
            type.bottom = 'start'
          }
        }
      }
      if (cells[row][column + 1]) {
        if (!cells[row][column + 1].top && !cells[row][column + 1].bottom) {
          if (cell.top) {
            type.top = 'end'
          }
          if (cell.bottom) {
            type.bottom = 'end'
          }
        }
      }
      if (column === cells[row].length - 1) {
        if (cell.top) {
          type.top = 'end'
        }
        if (cell.bottom) {
          type.bottom = 'end'
        }
      }
    }

    // check if previous row has a left/right border or no
    if (cell.left || cell.right) {
      // if previous row
      if (cells[row - 1]) {
        if (cell.left && !cell.top && cells[row - 1][column] && !cells[row - 1][column].left && !cells[row - 1][column].bottom) {
          type.left = 'end-side'
        }

        if (cell.right && !cell.top && cells[row - 1][column] && !cells[row - 1][column].right && !cells[row - 1][column].bottom) {
          type.right = 'end-side'
        }
      }
    }

    return type
  }
}

app.shared.pools.mixin(app.Fence)
