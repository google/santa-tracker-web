goog.provide('app.Belt');

goog.require('app.BeltItem');
goog.require('app.BeltItemPool');
goog.require('app.Closet');
goog.require('app.Constants');
goog.require('app.Controls');
goog.require('app.State');


/**
 * Class for main conveyor belt with animates elves and raindeers
 * @param {Element} context DOM element containing the scene.
 * @constructor
 * @export
 */
app.Belt = function(context) {
  this.$context = $(context);
  this.$el = $('.conveyor-belt', context);
  this.itemsOnBelt = [];
  this.distance = this.$el.width() + Math.abs(app.Constants.OFFSET);

  this.state = new app.State(this.distance);
  this.$state = $(this.state);

  this.elfPool = new app.BeltItemPool($('.conveyor-belt__item--elf', context));
  this.reindeerPool = new app.BeltItemPool($('.conveyor-belt__item--reindeer', context));
  this.closet = new app.Closet($('.closet', context), context, this.state);
  this.controls = new app.Controls($('.speed-controls', context), this.state);

  this.init_();
};

app.Belt.prototype = {

  noReindeerOnBelt_: function() {
    var l = this.itemsOnBelt.length,
        item,
        i;

    for (i = 0; i < l; i++) {
      item = this.itemsOnBelt[i];
      if (item.isReindeer()) {
        return false;
      }
    }
    return true;
  },

  timeForReindeer_: function() {
    if (this.noReindeerOnBelt_()) {
      return true;
    }

    if (this.itemsOnBelt[this.itemsOnBelt.length - 1].isReindeer()) {
      return false;
    }

    // randomize with probability
    var idx = Math.floor(Math.random() * app.Constants.REINDEER_PROBABILITY.length);
    return app.Constants.REINDEER_PROBABILITY[idx];
  },

  getNextItem: function() {
    var item;

    if (!this.state.isNormalState() && this.timeForReindeer_()) {
      item = this.reindeerPool.getFreeItem();
    }

    if (!item) {
      item = this.elfPool.getFreeItem();
    }

    return item;
  },

  onEnterBelt: function(item) {
    item.enterBelt();
    // add next item unless first setup
    if (!this.setup) {
      this.addItem();
    }
  },

  onInsideCloset: function(item, colorIndex) {
    this.closet.dress(item);
  },

  /**
   * Recycle elf DOM element and clean up tweens/callbacks from the timeline
   * @param {BeltItem} item BeltItem object
   * @param {Array} tweenReferences Array of GSAP items to remove from the timeline
   */
  onExitBelt: function(item, tweenReferences) {
    var i,
        l = tweenReferences.length;

    for (i = 0; i < l; i++) {
      this.timeline.remove(tweenReferences[i]);
    }

    this.closet.undress(item);
    item.exitBelt();
    var index = this.itemsOnBelt.indexOf(item);
    if (index > -1) {
      this.itemsOnBelt.splice(index, 1);
    }
  },

  timeToCloset: function(time) {
    var offset = Math.abs(app.Constants.OFFSET) - (this.closet.$el.width());
    var midpointAsSeconds = (app.Constants.DURATION + (this.state.dx() * offset)) * 0.5;
    return time + midpointAsSeconds;
  },

  itemWidthAsSeconds: function(item) {
    return this.state.dx() * item.outerWidth();
  },

  scheduleItem: function(item, startTime) {
    var tweenReferences = [],
        startCallback,
        elfTween,
        closetCallback;

    this.itemsOnBelt.push(item);
    
    startCallback = TweenLite.delayedCall(0, this.onEnterBelt, [item], this);

    elfTween = TweenLite.fromTo(item.$el, app.Constants.DURATION, {x: 0}, {
      css: {x: this.distance, force3D: true},
      ease: Linear.easeNone,
      onComplete: this.onExitBelt.bind(this),
      onCompleteParams: [item, tweenReferences]
    });

    closetCallback = TweenLite.delayedCall(0, this.onInsideCloset, [item, startTime], this);

    this.timeline.add(startCallback, startTime);
    this.timeline.add(elfTween, startTime);
    this.timeline.add(closetCallback, this.timeToCloset(startTime));

    tweenReferences.push(startCallback);
    tweenReferences.push(elfTween);
    tweenReferences.push(closetCallback);
  },

  addItem: function(startTime) {
    var startTime = startTime || this.timeline.time();

    var item = this.getNextItem();
    if (item) {
      startTime += this.itemWidthAsSeconds(item); // delay based on width of item
      this.closet.undress(item);
      this.scheduleItem(item, startTime);
    }
    else {
      // pool size and margin between items must be set so we dont run out of items in the pool
      console.warn('NO FREE ITEM IN POOL');
    }

    return item;
  },

  setSpeedClass_: function(className) {
    this.$context.removeClass(app.Constants.CLASS_SPEED_MEDIUM);
    this.$context.removeClass(app.Constants.CLASS_SPEED_FAST);
    if (className) {
      this.$context.addClass(className);
    }
  },

  onStateChange_: function() {
    this.setSpeedClass_(this.state.className());
    this.timeline.timeScale(this.state.timeScale());

    window.santaApp.fire('sound-trigger', this.state.soundEventName());
  },

  init_: function() {
    this.timeline = new TimelineMax();
    this.timeline.stop();

    this.$state.bind('change', this.onStateChange_.bind(this));

    //////////////////////////////////////////////
    // SETUP BELT ON LOAD
    //////////////////////////////////////////////
    this.setup = true;
    var seekTime = 1;
    var preLoadWidth = 0;

    for (var j = 0; j < 6; j++) {
      var item = this.addItem(seekTime);
      seekTime += this.itemWidthAsSeconds(item);
    }

    // start 1 second before to be sure we trigger callbacks for last item
    this.timeline.seek(seekTime - 1, false);
    this.setup = false;
    this.timeline.play();
  },

  destroy: function() {
    this.timeline.kill();
    this.timeline.remove();
    this.$state.unbind();

    this.controls.destroy();
    this.elfPool = null;
    this.reindeerPool = null;
  }

};
