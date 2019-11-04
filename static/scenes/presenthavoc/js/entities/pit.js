goog.provide('app.Pit')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Pit = class Pit extends app.Entity {
  constructor(game, position) {
    super(game)
    this.position = position
    this.elem = document.createElement('div')

    document.getElementById('pits').append(this.elem)

    this.elem.setAttribute('class', 'pit')

    this.game.board.addEntityToBoard(
        this,
        this.position.x,
        this.position.y,
        this.position.width,
        this.position.height)
    this.render()
  }

  render() {
    super.render()
    this.elem.style.height = `${Utils.gridToPixelValue(this.position.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.position.width)}px`
    Utils.renderAtGridLocation(this.elem, this.position.x, this.position.y)
  }

  onContact(player) {
    super.onContact(player)
    return Constants.PLAYER_ACTIONS.RESTART
  }
}