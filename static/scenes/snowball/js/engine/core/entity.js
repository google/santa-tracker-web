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
