class SoundManager {
  constructor() {
    window.addEventListener('shape_collide', this.playSound)

    this.playSound = this.playSound.bind(this)
  }

  playSound(e) {
    const { force } = e.detail
    console.log('boom', force)
    // play sound here
  }
}

export default new SoundManager()
