class SoundManager {
  constructor() {
    window.addEventListener('shape_collide', this.playCollisionSound.bind(this))
    this.lastCollisionTime = 0;
  }

  playCollisionSound(e) {
    const { force, type, mass, scale } = e.detail

    let now = performance.now();
    if (now - this.lastCollisionTime > 50) {
      let pitch = Math.abs(1 - (mass / 80)) + 0.5 + Math.random() * 0.2;
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
