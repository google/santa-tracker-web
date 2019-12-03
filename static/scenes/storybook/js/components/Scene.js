class Scene {
  constructor() {
    this.activeIndex = 0
    // TODO: USE CHAPTERS' LENGTH HERE
    this.pages = 10

    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
  }

  prev() {
    this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.pages - 1
    console.log(this.activeIndex)
  }

  next() {
    this.activeIndex = this.activeIndex < this.pages - 1 ? this.activeIndex + 1 : 0
    console.log(this.activeIndex)
  }
}

export default new Scene()