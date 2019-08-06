import { Snowball } from '../snowball.js';

export class BigSnowball extends Snowball {
  constructor() {
    super(40);
    this.splat.size = 75;
    this.splat.quantity = 7;
    this.trail.size = 10;
  }
};
