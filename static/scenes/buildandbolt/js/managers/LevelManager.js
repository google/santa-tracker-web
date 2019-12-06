goog.provide('app.LevelManager')

goog.require('Levels')

goog.require('app.shared.LevelUp')

// singleton to manage the levels
class LevelManager {
  init(_, bgElem, numberElem, startLevel) {
    this.levelUp = new LevelUp(_, bgElem, numberElem)
    this.current = 0 // current level
    this.startLevel = startLevel

    this.update()
  }

  show() {
    this.levelUp.show(this.current + 1, this.startLevel)
  }

  goToNext() {
    this.current++
    this.update()
  }

  reset() {
    this.current = 0
    this.update()
  }

  update() {
    this.toyType = Levels[this.current].toyType
    this.toysCapacity = Levels[this.current].toysCapacity
  }
}

app.LevelManager = new LevelManager()
