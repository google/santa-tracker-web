const classFreeItems = new WeakMap();
const classAllocatedItems = new WeakMap();

/** @interface */
function AllocatableInterface() {}

/**
 * @param {...*} args
 */
AllocatableInterface.allocate = function(...args) {};

/**
 * @param {AllocatableInterface} allocatable
 */
AllocatableInterface.free = function(allocatable) {};

/**
 * @return {AllocatableInterface}
 */
AllocatableInterface.createItem = function() {};

Object.defineProperty(AllocatableInterface, 'freeItems', {
  /**
   * @return {Array.AllocatableInterface}
   */
  get() {}
});

Object.defineProperty(AllocatableInterface, 'allocatedItems', {
  /**
   * @return {Array.AllocatableInterface}
   */
  get() {}
});

AllocatableInterace.prototype.onAllocated = function() {};
AllocatableInterace.prototype.onFreed = function() {};

export const Allocatable = SuperClass => {

  /**
   * @polymer
   * @implements {AllocatableInterface}
   */
  class Allocatable extends SuperClass {
    static allocate(...args) {
      if (this.freeItems.length === 0) {
        this.freeItems.push(this.createItem());
      }

      const item = this.freeItems.pop();
      this.allocatedItems.push(item);
      item.onAllocated(...args);
      return item;
    }

    static free(item) {
      const index = this.allocatedItems.indexOf(item);
      if (index === -1) {
        return;
      }
      this.allocatedItems.splice(index, 1);
      item.onFreed();
      this.freeItems.push(item);
    }

    static createItem() {
      return new this();
    }

    static get freeItems() {
      if (!classFreeItems.has(this)) {
        classFreeItems.set(this, []);
      }

      return classFreeItems.get(this);
    }

    static get allocatedItems() {
      if (!classAllocatedItems.has(this)) {
        classAllocatedItems.set(this, []);
      }

      return classAllocatedItems.get(this);
    }

    onAllocated() {}
    onFreed() {}
  };

  return Allocatable;
};
