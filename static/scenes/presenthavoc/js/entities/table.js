goog.provide('app.Table')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Table = class Table extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config
    this.gameControls = game.controls

    this.elem = document.createElement('div')
    document.getElementById('tables').append(this.elem)
    this.elem.setAttribute('class', 'table')

    this.render()
    this.game.board.addEntityToBoard(this, this.config.x, this.config.y, Constants.TABLE_WIDTH, Constants.TABLE_HEIGHT)
  }

  reset() {

  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    if (this.gameControls.trackedKeys[player.controls.action]) {
     return [Constants.PLAYER_ACTIONS.ADD_TOY_PART, Constants.PLAYER_ACTIONS.BLOCK]
    } else {
      return [Constants.PLAYER_ACTIONS.BLOCK]
    }
  }
}
