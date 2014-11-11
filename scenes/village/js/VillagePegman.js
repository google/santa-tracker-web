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
VillagePegman.MIN_SKYDIVE_TIME_ = 45000;

/**
 * @private
 * @type {number}
 */
VillagePegman.MAX_SKYDIVE_TIME_ = 120000;

/**
 * @private
 * @type {number}
 */
VillagePegman.LAND_TIME_ = 15000;

/**
 * Start sending random snow mobiles for a ride
 */
VillagePegman.prototype.start = function() {
  //this.scheduleRandomSkyDive_();
  console.log('skyDive start');
  this.skyDive_();
};

/**
 * Stop sending snow mobiles and clear any timeouts
 */
VillagePegman.prototype.stop = function() {
  window.clearTimeout(this.pickupPegmanTimeoutID_);
};

/**
 * Send a snow mobile for a drive
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
  console.log('pickup in', pickupTime);
  this.pickupPegmanTimeoutID_ = window.setTimeout(
      this.pickupPegman_.bind(this), pickupTime);
};

VillagePegman.prototype.pickupPegman_ = function() {
  console.log('picking up the pegman');
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