class SoundManager {
  constructor() {
    window.addEventListener('shape_collide', this.playCollisionSound.bind(this))
    this.lastCollisionTime = 0

    this.maxMassForShape = {
      arch: 850,
      sphere: 67,
      tree: 486,
      cube: 411,
      gift: 592,
      pyramid: 536,
      prism: 555,
      snowman: 100,

    }
  }

  playCollisionSound(e) {
    const { force, type, mass } = e.detail
    const pitch = this.getPitch(type, mass)
    const volume = Math.max(0, Math.min(1, (force - 0.5 ) / 3 ))
    this.play('snowbox_collision', volume, pitch, mass > 40)
  }

  getPitch(type, mass) {
    const maxMass = this.maxMassForShape[type] || 100
    const massPitch = Math.min(2, Math.max(0.3, mass / maxMass))
    return Math.abs(1 - massPitch) + 0.5 + Math.random() * 0.2
  }

  play(event, ...args) {
    const argsToSend = [].slice.call(arguments)
    argsToSend.unshift('sound-trigger')
    window.santaApp.fire.apply(this, argsToSend)
  }

  highlightShape(subject) {
    const pitch = this.getPitch(subject.name, subject.currentMass)
    this.play('snowbox_world_shape_highlight', pitch)
  }
}

export default new SoundManager()
