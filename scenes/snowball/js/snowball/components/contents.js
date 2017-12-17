import { Component } from './component.js';

export class Contents extends Component {
  constructor() {
    super();
    this.inventory = [];
  }

  get isEmpty() {
    return this.inventory.length === 0;
  }

  clear() {
    this.inventory = [];
  }
}
