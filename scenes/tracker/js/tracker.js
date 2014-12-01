/**
 * @constructor
 */
function Tracker(el) {
  /**
   * @private {Element}
   */
  this.el_ = el;
  this.setup();
}



Tracker.prototype.setup = function() {
  /**
   * @private
   */
  this.santaMap_ = new SantaMap(this.el_.querySelector('#tracker-map'));
};


Tracker.prototype.onShow = function() {
  this.map_ = this.santaMap_.createMap();

  // TODO: add resize handler.
};


Tracker.prototype.onHide = function() {
  // TODO: remove resize handler.
};

