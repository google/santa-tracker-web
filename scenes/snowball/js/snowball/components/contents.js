export class Contents {
  constructor() {
    this.inventory = [];
  }

  get isEmpty() {
    return this.inventory.length === 0;
  }

  clear() {
    this.inventory = [];
  }
}
