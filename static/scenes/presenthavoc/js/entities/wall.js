goog.provide('app.Wall')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Wall = class Wall extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config

    this.elem = document.createElement('div')
    document.getElementById('walls').append(this.elem)
    this.elem.setAttribute('class', 'wall')
    this.render()
    this.game.board.addEntityToBoard(this,
        this.config.x, this.config.y,
        this.config.width, this.config.height)
  }

  reset() {

  }

  onFrame() {

  }

  render() {
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    super.onContact(player)
    return Constants.PLAYER_ACTIONS.BLOCK
  }

}