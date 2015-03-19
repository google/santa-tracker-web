/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('app.shared.pools');

var pools = app.shared.pools = {
  objects: [],
  mixin: function(obj, options) {
    options = options || {};
    obj.pool_ = [];
    pools.objects.push(obj);

    /**
     * Get an object from the pool or create a new one.
     * @param {Object} owner An owner which is passed to the constructor.
     * @return {Object} A new or reused object. Or null if a fixed pool is empty.
     */
    obj.pop = function(owner) {
      ensurePooled_(owner);

      // Get instance from the pool and initialize it
      var instance = obj.pool_.shift();
      return initInstance_(instance, arguments);
    };

    /**
     * Get a random object from the pool or create a new one.
     * @param {Object} owner An owner which is passed to the constructor.
     * @return {Object} A new or reused object. Or null if a fixed pool is empty.
     */
    obj.popRandom = function(owner) {
      ensurePooled_(owner);

      var randomIndex = Math.floor(Math.random() * obj.pool_.length);
      var instance = obj.pool_[randomIndex];
      var lastInstance = obj.pool_.pop();
      if (lastInstance && instance !== lastInstance) {
        obj.pool_[randomIndex] = lastInstance;
      }
      return initInstance_(instance, arguments);
    };

    /**
     * Add an object to the pool.
     */
    obj.pool = function(owner) {
      // Create new instance
      var instance = new obj(owner);

      // Add to pool
      obj.pool_.push(instance);
    };

    /**
     * Return an used object for reuse.
     * @param {Object} instance The instance of the object.
     */
    obj.push = function(instance) {
      if (instance.onDispose) {
        instance.onDispose();
      }

      obj.pool_.push(instance);
    };

    /**
     * Prototype method to return the object for reuse.
     */
    obj.prototype.remove = function() {
      obj.push(this);
    };

    /**
     * Inheritable handlers for initializing and disposing an object
     * when leaving or entering the pool.
     */
    obj.prototype.onInit = obj.prototype.onInit || function() {};
    obj.prototype.onDispose = obj.prototype.onDispose || function() {};


    // Private functions

    /**
     * Conditionally pools an item for use if needed and allowed.
     * @param {Object} owner
     * @private
     */
    function ensurePooled_(owner) {
      if (!options.fixed && obj.pool_.length === 0) {
        obj.pool(owner);
      }
    }

    /**
     * Initialises a pooled instance if one exists.
     * @param {Object} instance
     * @param {!Array.<Object>} popArgs
     * @return {Object}
     * @private
     */
    function initInstance_(instance, popArgs) {
      if (instance) {
        instance.onInit.apply(instance,
            Array.prototype.slice.call(popArgs, 1));
      }
      return instance || null;
    }
  },
  empty: function() {
    for (var i = 0; i < pools.objects.length; i++) {
      pools.objects[i].pool_ = [];
    }
  }
};
