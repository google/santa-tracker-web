goog.provide('app.LevelManager');

goog.require('Constants');
goog.require('Levels');

goog.require('app.shared.LevelUp');

// singleton to manage the levels
class LevelManager {
  init(_, bgElem, numberElem) {
    this.levelUp = new LevelUp(_, bgElem, numberElem);
    this.current = 0; // current level
  }

  transition(transitionInEnd, transitionOutEnd) {
    // startLevel is called after end of levelup transition OUT
    this.levelUp.show(this.current + 1, transitionOutEnd);

    // end of levelup transition IN
    setTimeout(() => {
      transitionInEnd();
    }, Constants.LEVEL_TRANSITION_TIMING);
  }

  goToNextLevel(updateLevel, startCountdown) {
    this.current++;
    this.transition(updateLevel, startCountdown);
  }

  reset(updateLevel, startCountdown) {
    this.current = 0;
    this.transition(updateLevel, startCountdown);
  }

  updateLevel() {
    this.toyType = Levels[this.current].toyType;
    this.toysCapacity = Levels[this.current].toysCapacity;
  }
}

app.LevelManager = new LevelManager();
