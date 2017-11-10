export class Health {
  constructor() {
    this.alive = true;
  }

  get dead() {
    return !this.alive;
  }
};
