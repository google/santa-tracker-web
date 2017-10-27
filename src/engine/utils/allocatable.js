export const Allocatable = SuperClass => {
  const Allocatable = class extends SuperClass {
    static allocate(...args) {
      if (this.freeItems.length === 0) {
        this.freeItems.push(this.createItem());
      }

      const item = this.freeItems.pop();
      this.allocatedItems.push(item);
      item.setup(...args);
      return item;
    }

    static free(item) {
      const index = this.allocatedItems.indexOf(item);
      if (index === -1) {
        return;
      }
      this.allocatedItems.splice(index, 1);
      item.teardown();
      this.freeItems.push(item);
    }

    static createItem() {
      return new this();
    }

    setup() {}
    teardown() {}
  };

  Allocatable.freeItems = [];
  Allocatable.allocatedItems = [];

  return Allocatable;
};
