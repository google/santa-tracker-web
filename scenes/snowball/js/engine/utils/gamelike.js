import { ClockSystem } from '../systems/clock-system.js';

/** @interface **/
function GamelikeInterface() {}

GamelikeInterface.prototype.setup = function() {};
GamelikeInterface.prototype.update = function() {};

/**
 * @param {*} level
 */
GamelikeInterface.prototype.setLevel = function(level) {};

Object.defineProperty(GamelikeInterface.prototype, 'level', {
  /**
   * @return {*}
   */
  get() {}
});

class DefaultBaseClass {}

export const Gamelike = (SuperClass = DefaultBaseClass) => class extends SuperClass {
  constructor() {
    super();
    this.clockSystem = new ClockSystem();

    this.currentLevel = null;
    this.ready = false;

    this.clockSystem.startClock('gameloop', time => {
      this.preciseTick = time * 60 / 1000;
      this.tick = Math.floor(this.preciseTick);

      if (!this.ready) {
        this.setup();
        this.ready = true;
      }

      if (this.currentLevel == null) {
        return;
      }

      this.update();
    });
  }

  setup() {}

  update() {}

  teardown() {
    this.clockSystem.teardown(this);
  }

  // NOTE(cdata): Closure compiler does not support assigning to a super
  // property yet, so this is not a setter:
  setLevel(level) {
    if (this.currentLevel != null) {
      this.currentLevel.teardown(this);
    }

    this.currentLevel = level;

    if (this.currentLevel != null) {
      this.currentLevel.setup(this);
    }
  }

  get level() {
    return this.currentLevel;
  }
};
