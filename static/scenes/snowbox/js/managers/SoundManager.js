class SoundManager {
  constructor() {
    window.addEventListener('shape_collide', this.playCollisionSound.bind(this))
    this.lastCollisionTime = 0;
  }

  playCollisionSound(e) {
    const { force, type, mass, scale } = e.detail

    let maxMassForShape = {
      arch: 1280,
      sphere:83.77,
      tree:205,
      cube: 514.78
    }
    
    
    let now = performance.now();
    if (now - this.lastCollisionTime > 50) {
      let maxMass = maxMassForShape[type] || 100;
      let massPitch = Math.min(2, Math.max(0.3, mass / maxMass));
      let pitch = Math.abs(1 - massPitch) + 0.5 + Math.random() * 0.2;
      let volume = Math.max(0, Math.min(1, (force - 0.5 ) / 3 ));
      this.play("snowbox_collision", volume, pitch, mass > 40);
      this.lastCollisionTime = now;
    }
  }

  play(event, ...args) {
    let argsToSend = [].slice.call(arguments);
    argsToSend.unshift('sound-trigger')
    window.santaApp.fire.apply(this, argsToSend);
  }
}

export default new SoundManager()
