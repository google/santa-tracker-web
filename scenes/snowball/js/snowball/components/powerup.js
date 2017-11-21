export const powerupType = {
  NOTHING: 0,
  BIG_SNOWBALL: 1
};

export class Powerups {
  constructor() {
    this.primary = null;
    this.secondary = null;
    this.swapped = false;
  }

  swap() {
    this.swapped = !this.swapped;
  }

  get active() {
    return this.swapped
        ? this.secondary
        : this.primary;
  }

  set active(value) {
    if (this.swapped) {
      this.secondary = value;
    } else {
      this.primary = value;
    }

    if (this.active == null && this.inactive != null) {
      this.swap();
    }
  }

  get inactive() {
    return this.swapped
        ? this.primary
        : this.secondary;
  }

  set inactive(value) {
    if (this.active == null) {
      return;
    }

    if (this.swapped) {
      this.primary = value;
    } else {
      this.secondary = value;
    }
  }

  decrementActiveQuantity() {
    const { active } = this;

    if (active == null) {
      return;
    }

    active.quantity--;

    if (active.quantity <= 0) {
      this.pop();
    }
  }

  pop() {
    this.active = null;
  }

  collect(type) {
    if (this.active == null) {
      this.active = new Powerup(type);
    } else {
      this.inactive = new Powerup(type);
    }
  }
};

export class Powerup {
  constructor(type) {
    this.type = type;
    this.quantity = 3;
  }
};
