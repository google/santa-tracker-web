// NOTE(cdata): This component might have too much overlap with
// Arrival. Consider combining the two.
export class Presence {
  constructor() {
    this.present = true;
    this.exiting = false;
  }

  get exiting() {
    return this.exitTime > -1;
  }

  set exiting(value) {
    if (value === true) {
      if (!this.exiting) {
        this.exitTime = performance.now();
      }
    } else {
      this.exitTime = -1;
    }
  }

  get gone() {
    return !this.present && !this.exiting;
  }
};
