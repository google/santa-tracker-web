import { Component } from './component.js';

export class Trail extends Component {
  constructor(size, color, showTest) {
    super();

    this.size = size;
    this.color = color;
    this.showTest = showTest;
  }
};
