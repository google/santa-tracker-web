goog.provide('app.Entity')


app.Entity = class Entity {
  constructor(game) {
    this.game = game
  }

  reset() {

  }

  onFrame() {

  }

  render() {

  }

  /**
   * returns the action(s) that result from the player colliding with this entity,
   * or null if no effect.
   */
  onContact(player) {
    return null
  }
}