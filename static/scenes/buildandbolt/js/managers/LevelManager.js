goog.provide('app.LevelManager')

goog.require('app.shared.LevelUp')

// singleton to manage the levels
class LevelManager {
  init(_, bgElem, numberElem, startLevel) {
    this.levelUp = new LevelUp(_, bgElem, numberElem)
    this.current = 0 // current level
    this.startLevel = startLevel
  }

  show() {
    this.levelUp.show(this.current + 1, this.startLevel)
  }

  goToNext() {
    this.current++
  }

  reset() {
    this.current = 0
  }
}

app.LevelManager = new LevelManager()
