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

// NOTE(cdata): Need to declare this class outside of an expression
// in order for closure compiler to work.
class DefaultBaseClass {}


/** @interface */
function EntityInterface() {}

/**
 * @param {Game} game
 */
EntityInterface.prototype.setup = function(game) {};

/**
 * @param {Game} game
 */
EntityInterface.prototype.teardown = function(game) {};

/**
 * @param {Game} game
 */
EntityInterface.prototype.update = function(game) {};

/** @param {function()} SuperClass */
export const Entity = (SuperClass = DefaultBaseClass) => {

  /** @implements {EntityInterface} */
  class EntityClass extends SuperClass {
    /**
     * @param {Game} game
     */
    setup(game) {}

    /**
     * @param {Game} game
     */
    teardown(game) {}

    /**
     * @param {Game} game
     */
    update(game) {}
  }

  return EntityClass;
};
