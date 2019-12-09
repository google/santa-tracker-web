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
    this.show()
  }

  reset() {
    this.current = 0
    this.update()
  }

  update() {
    this.toyType = Levels[this.current].toyType
    this.toysCapacity = Levels[this.current].toysCapacity

    switch (this.toyType.key) {
      default:
        break
      case 'car':
        this.nbToyParts = 2
        break
      case 'robot':
        this.nbToyParts = 3
        break
      case 'teddy':
        this.nbToyParts = 3
        break
      case 'rocket':
        this.nbToyParts = 4
        break
    }
  }
}

app.LevelManager = new LevelManager()
