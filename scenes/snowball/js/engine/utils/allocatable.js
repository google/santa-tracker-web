/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

AllocatableInterface.prototype.onAllocated = function() {};
AllocatableInterface.prototype.onFreed = function() {};

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
