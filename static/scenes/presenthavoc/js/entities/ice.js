goog.provide('app.Ice')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Ice = class Ice extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    document.getElementById('ice').append(this.elem)
    this.elem.setAttribute('class', 'ice')

    this.game.board.addEntityToBoard(
        this,
        this.config.x,
        this.config.y,
        this.config.width,
        this.config.height)
    this.render()
  }

  render() {
    super.render()
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.ICE]
  }
}
