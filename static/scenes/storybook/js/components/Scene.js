class Scene {
  constructor() {
    this.update = this.update.bind(this)
  }

  update(i) {
    console.log(`go to chapter ${i}`)
  }
}

export default new Scene()