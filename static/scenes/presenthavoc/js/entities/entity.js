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
   * @return {boolean} true if player should ignore any other entity's effects
   *                        e.g. in the case of a restart
   */
  onContact(player) {
    return false
  }
}