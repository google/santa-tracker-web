// NOTE(cdata): This component might have too much overlap with
// Arrival. Consider combining the two.
export class Presence {
  constructor() {
    this.present = true;
    this.exiting = false;
  }

  get gone() {
    return !this.present && !this.exiting;
  }
};
