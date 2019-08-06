export class Component {
  static fromJSON(json) {
    const instance = new (this);
    Object.assign(instance, json);
    return instance;
  }
};
