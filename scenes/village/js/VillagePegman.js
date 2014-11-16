/**
 * @constructor
 */
function VillagePegman(el) {
  this.container_ = el;
}

/**
 * @private
 * @type {number}
 */
VillagePegman.SKYDIVE_TIME_ = 25000;

/**
 * @private
 * @type {number}
 */
VillagePegman.FREEFALL_TIME_ = 0.301 * VillagePegman.SKYDIVE_TIME_;

/**
 * @private
 * @type {number}
 */
VillagePegman.MIN_SKYDIVE_TIME_ = 90000;

/**
 * @private
 * @type {number}
 */
VillagePegman.MAX_SKYDIVE_TIME_ = 200000;

/**
 * @private
 * @type {number}
 */
VillagePegman.LAND_TIME_ = 15000;

/**
 * Start a skydive
 */
VillagePegman.prototype.start = function() {
  this.skyDive_();
};

/**
 * Stop skydiving
 */
VillagePegman.prototype.stop = function() {
  window.clearTimeout(this.pickupPegmanTimeoutID_);
};

/**
 * Sky dive
 * @param {!Element} snowMobile
 */
VillagePegman.prototype.skyDive_ = function() {
  var pegman = this.container_.querySelector('#pegman');

  pegman.classList.switch('landed', 'dive');
  pegman.classList.add('diving');
  pegman.classList.remove('takeoff');

  window.setTimeout(function() {
    pegman.classList.switch('dive', 'chute');
  }, VillagePegman.FREEFALL_TIME_);

  window.setTimeout(function() {
    pegman.classList.switch('chute', 'landed');
    pegman.classList.remove('diving');
  }, VillagePegman.SKYDIVE_TIME_);

  this.schedulePegmanPickup_();
};

VillagePegman.prototype.schedulePegmanPickup_ = function() {
  window.clearTimeout(this.pickupPegmanTimeoutID_);

  var pickupTime = VillagePegman.MIN_SKYDIVE_TIME_ +
      Math.random() * VillagePegman.MAX_SKYDIVE_TIME_;
  this.pickupPegmanTimeoutID_ = window.setTimeout(
      this.pickupPegman_.bind(this), pickupTime);
};

VillagePegman.prototype.pickupPegman_ = function() {
  var pegman = this.container_.querySelector('#pegman');

  var spaceship = this.container_.querySelector('#spaceship');
  spaceship.classList.add('to-space');

  var pegmanSpaceship = this.container_.querySelector('#pegman-spaceship');
  pegmanSpaceship.classList.add('land');

  var t = VillagePegman.LAND_TIME_+200;

  window.setTimeout(function() {
    pegman.classList.add('takeoff');
  }, t);

  t += 200;

  window.setTimeout(function() {
    pegmanSpaceship.classList.remove('land');
  }, t);

  t += VillagePegman.LAND_TIME_;

  window.setTimeout(function() {
    pegman.classList.remove('landed');
  }, t);

  t += 5000;

  window.setTimeout(this.skyDive_.bind(this), t);
};
