goog.provide('app.PresentBox')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.PresentBox = class PresentBox extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    document.getElementById('present-boxes').append(this.elem)
    this.elem.setAttribute('class', 'present-box')

    this.render()
    this.game.board.addEntityToBoard(this, this.config.x, this.config.y, Constants.PRESENT_WIDTH, Constants.PRESENT_HEIGHT)
  }

  reset() {

  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    // TODO: add shift click detection
    for (const part of this.config.parts) {
      if (player.toyParts.indexOf(part) == -1) {
        return [Constants.PLAYER_ACTIONS.BLOCK]
      }
    }

    return [Constants.PLAYER_ACTIONS.ACCEPT_TOY, Constants.PLAYER_ACTIONS.BLOCK]
  }
}
