goog.provide('app.Level');

goog.require('app.Scene');
goog.require('app.PlayerElfStates');
goog.require('app.getElfImage');
goog.require('app.isElf');
goog.require('app.systems.RaycasterSystem');
goog.require('app.systems.PresentSystem');

/** @enum {userEvents} */
const UserEvents = {
  NONE: 'none',
  TAP: 'tap',
}

/**
 * Handles everything that lives within one level.
 *
 * For each new level, and when the game is restarted, a new instance will be created.
 */
class Level {

  /**
   * @param {*} renderer ThreeJS renderer.
   * @param { function(number):void } addScore Function for adding to the game's score.
   */
  constructor(renderer, scoreboard) {
    this.scene = new app.Scene();
    this.camera = this.scene.getCamera();
    this.presentSystem = new app.PresentSystem(this.scene);
    this.raycasterSystem = new app.RaycasterSystem(renderer, this.camera, this.scene);
    this.scoreboard = scoreboard;

    /** @type { boolean } */
    this.trainIsMoving = false;

    this.currentUserEvent = UserEvents.NONE;

    // TODO: breakout into helper class
    this.playerElfState = app.PlayerElfStates.READY;
    this.animateCooldown = 0;
  }

  cleanUp() {
    // For the moment, it seems like nothing is actually needed here.
  }

  render(renderer) {
    renderer.render(this.scene.scene, this.camera);
  }

  update(deltaSeconds) {
    if (this.trainIsMoving) {
      this.scene.update(deltaSeconds);
      this.scoreboard.onFrame(deltaSeconds);
    }
    // TODO: update present system so that a new present appears only
    // when elf is ready again
    this.presentSystem.update(deltaSeconds);

    // TODO: break out into helper class
    // Update elf and game state transitions.
    if (this.playerElfState == app.PlayerElfStates.READY) {
      if (this.currentUserEvent == UserEvents.TAP) {
        this.currentUserEvent = UserEvents.NONE;
        this.playerElfState = app.PlayerElfStates.THROWING;
        // TODO: tune
        this.animateCooldown = 0.17;
      }
    } else if (this.playerElfState == app.PlayerElfStates.THROWING) {
      this.animateCooldown -= deltaSeconds;
      if (this.animateCooldown < 0) {
        this.playerElfState = app.PlayerElfStates.READY;
      }
    }

    // update elf view model
    const playerElf = this.scene.scene.getObjectByName('PlayerElf');
    if (this.playerElfState == app.PlayerElfStates.READY) {
      playerElf.children[0].material.map = getElfImage('Elf_Throw@2x.png');
    } else if (this.playerElfState == app.PlayerElfStates.THROWING) {
      playerElf.children[0].material.map = getElfImage('Elf_Throw2@2x.png');
    }
  }

  async handleClick(clientX, clientY) {
    // register event
    if (this.currentUserEvent == UserEvents.NONE &&
        // Ignore events while Elf is throwing. We could change this if we
        // want to interrupt the "animation" so we can more quickly spam
        // throws, but the current cooldown is short enough that we can get 
        // multiple throws per second already. 
        this.playerElfState != app.PlayerElfStates.THROWING) {
      this.currentUserEvent = UserEvents.TAP;
    }

    const intersections = this.raycasterSystem.cast(clientX, clientY);
    if (intersections.length > 0) {
      await this.throwAt(intersections[0].point, intersections[0].object);
    }
  }

  async throwAt(position, targetObject) {
    console.log('throw present')
    console.log(position)
    console.log(targetObject);

    const presentLanded = this.presentSystem.shoot(position);
    if (app.isElf(targetObject) && !targetObject.userData.hasPresent) {
      // Wait for the present to hit its target and then update the elf's sprite.
      targetObject.userData.hasPresent = true;
      await presentLanded;
      const textureWithPresent =
          getElfImage(targetObject.userData.assetUrl.replace('@', '_Holding@'));
      if (textureWithPresent) {
          targetObject.material.map = textureWithPresent;
      }
      window.santaApp.fire('sound-trigger', 'bl_score_red');

      this.scoreboard.addScore(100);
      // Start the train if it isn't already moving. Ok to call this multiple times.
      this.startTrain();
    }
  }

  async throwToClosest() {
    const closest = this.scene.findClosestElf();
    if (!closest) {
      console.log('no closest elf');
      return;
    }

    const position = new THREE.Vector3();
    closest.getWorldPosition(position);

    this.throwAt(position, closest);
  }

  startTrain() {
    this.trainIsMoving = true;

    const hand = document.querySelector('.tutorial-hand');
    hand.classList.add('hidden');
  }

}

app.Level = Level;
