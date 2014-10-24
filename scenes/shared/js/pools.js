var pools = {
  objects: [],
  mixin: function(obj) {
    obj.pool_ = [];
    pools.objects.push(obj);

    /**
     * Get an object from the pool or create a new one.
     * @param {Object} owner An owner which is passed to the constructor.
     * @return {Object} A new or reused object.
     */
    obj.pop = function(owner) {
      if (!this.pool_ || this.pool_.length === 0) {
        this.pool(owner);
      }

      // Get instance from the pool and initialize it
      var instance = this.pool_.shift();
      instance.onInit.apply(instance,
          Array.prototype.slice.call(arguments, 1));
      return instance;
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
  },
  empty: function() {
    for (var i = 0; i < pools.objects.length; i++) {
      pools.objects[i].pool_ = [];
    }
  }
};
