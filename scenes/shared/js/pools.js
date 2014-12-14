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
     * @return {?Object} A new or reused object. Or null if a fixed pool is empty.
     */
    obj.pop = function(owner) {
      ensurePooled_();

      // Get instance from the pool and initialize it
      var instance = this.pool_.shift();
      return initInstance_(instance, arguments);
    };

    /**
     * Get a random object from the pool or create a new one.
     * @param {object} owner An owner which is passed to the constructor.
     * @return {?Object} A new or reused object. Or null if a fixed pool is empty.
     */
    obj.popRandom = function(owner) {
      ensurePooled_();

      var randomIndex = Math.floor(Math.random() * this.pool_.length);
      var instance = this.pool_[randomIndex];
      var lastInstance = this.pool_.pop();
      if (lastInstance && instance !== lastInstance) {
        this.pool_[randomIndex] = lastInstance;
      }
      return initInstance_(instance, arguments);
    };

    /**
     * Add an object to the pool.
     */
    obj.pool = function(owner) {
      // Create new instance
      var instance = new this(owner);

      // Add to pool
      this.pool_.push(instance);
    };

    /**
     * Return an used object for reuse.
     * @param  {Object} instance The instance of the object.
     */
    obj.push = function(instance) {
      if (instance.onDispose) {
        instance.onDispose();
      }

      this.pool_.push(instance);
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
     * @param {object} owner
     * @private
     */
    function ensurePooled_(owner) {
      if (!options.fixed && this.pool_.length === 0) {
        this.pool(owner);
      }
    }

    /**
     * Initialises a pooled instance if one exists.
     * @param {?object} instance
     * @param {Array} popArgs
     * @return {?object}
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
