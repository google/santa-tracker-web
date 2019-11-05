goog.provide('app.Fence')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Fence = class Fence extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    document.getElementById('fences').append(this.elem)

    const classes = `fence${this.config.sides.left ? ' fence--left' : ''}${this.config.sides.right ? ' fence--right' : ''}${this.config.sides.top ? ' fence--top' : ''}${this.config.sides.bottom ? ' fence--bottom' : ''}`

    this.elem.setAttribute('class', classes)

    this.render()
    this.game.board.addEntityToBoard(this, this.config.x, this.config.y)
  }

  reset() {

  }

  render() {
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    // if (this.config.sides.top) {
    //   if (player.prevPosition.y <= this.config.y &&
    //       player.position.y >= this.config.y) {
    //     return Constants.PLAYER_ACTIONS.BLOCK
    //   }
    // }
  }
}
