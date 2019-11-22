goog.provide('app.Entity')


app.Entity = class Entity {
  constructor(game) {
    this.game = game
  }

  // for app.shared.pools
  onInit(config) {
    // all entities trigger action on cell by default
    this.config = { ...config, triggerAction: 'on-cell' }

    this.elem.classList.remove('hidden')
    this.render()
    this.game.board.addEntityToBoard(this,
        this.config.x, this.config.y,
        this.config.width, this.config.height)
  }

  // for app.shared.pools
  onDispose() {
    this.elem.classList.add('hidden')
  }

  onFrame() {

  }

  render() {

  }

  /**
   * Returns the action(s) that result from the player colliding with this entity,
   * or null if no effect.
   */
  onContact(player) {
    return null
  }
}