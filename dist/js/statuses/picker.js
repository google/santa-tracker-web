/**
 * Picks a status message for Santa.
 * @constructor
 */
function StatusPicker() {
  /**
   * A mapping between message id and message text.
   * @type {!Object.<string>}
   */
  this.msgs_ = {};

  /**
   * Status messages that can be shown at any time.
   * @type {!Array.<string>}
   */
  this.normal_ = ['...'];

  /**
   * The last message generated.
   * @private {string}
   */
  this.prevMessage_ = '';

  /**
   * The timestamp for the last message generated.
   * @private {number}
   */
  this.prev_ = 0;

  this.randMax_ = 2147483648; // 2 ** 31
}

/**
 * Set the message text.
 * @param {Object.<string>} messages a mapping between message id and message
 * text.
 */
StatusPicker.prototype.setMessages = function(messages) {
  this.msgs_ = messages || {};
  this.normal_ = [];
  for (var i = 0, id; id = StatusPicker.NORMAL_[i]; i++) {
    if (this.msgs_.hasOwnProperty(id)) {
      this.normal_.push(this.msgs_[id]);
    }
  }
};

/**
 * Prime number makes the update cycle seem more random.
 * @const
 * @private
 */
StatusPicker.UPDATE_INTERVAL_ = 27397; // around about every 27 seconds.

/**
 * @param {number} timestamp
 * @param {SantaState} state
 * @return {string}
 */
StatusPicker.prototype.pick = function(timestamp, state) {
  // Clamp down, so updates are only made every UPDATE_INTERVAL_ milliseconds.
  var n = timestamp - (timestamp % StatusPicker.UPDATE_INTERVAL_);
  if (this.prev_ == n) {
    return this.prevMessage_;
  }

  this.prev_ = n;
  var msg = this.pickSpecial_(state, n);
  if (!msg) {
    var r = this.rand_(n);
    var idx = r % this.normal_.length;
    msg = this.normal_[idx];
  }
  return this.prevMessage_ = msg;
};

/**
 * @param {SantaState} state
 * @param {number} r random number between 0 and 1
 * @return {string|null} message if matched, null otherwise
 */
StatusPicker.prototype.pickSpecial_ = function(state, r) {
  for (var i = 0, special; special = StatusPicker.SPECIAL_[i]; i++) {
    r = this.rand_(r);
    var result = special.call(this.msgs_, state, r / this.randMax_);
    if (result) {
      return result;
    }
  }
  return null;
};

/**
 * Generate a pseudorandom number based on a seed value.
 * @param {number} n the seed value.
 * @return {number} up to 2**31.
 */
StatusPicker.prototype.rand_ = function(n) {
  var a = 1103515245;
  var c = 12345;
  return (a * n + c) % this.randMax_;
};

/**
 * @param {string} id
 * @return {string}
 */
StatusPicker.prototype.getMsg_ = function(id) {
  return this.msgs_[id] || '...';
};

/**
 * A special status that is shown at some points in time.
 *
 * Note: jsdoc doesn't let us document a typedef, so ! is used in place of an @
 *
 * !this {Object.<string>} the mapping between message id and message text.
 * !param {SantaState} state
 * !param {number} rand a pseudorandom number between 0 and 1.
 * !return {string|null} status text, or null if the status wasn't matched.
 * @typedef {function(this:Object.<string>, SantaState, number):(string|null)}
 */
var SpecialStatus;

/**
 * Shows the status when it's within a certain distance of a given point.
 * @param {!LatLng} latLng location
 * @param {number} threshold maximum distance, in metres.
 * @param {string} msg message id
 * @return {SpecialStatus}
 */
StatusPicker.nearLatLng = function(latLng, threshold, msg) {
  return function(state) {
    var dist = Spherical.computeDistanceBetween(latLng, state.position);
    return dist < threshold ? this[msg] : null;
  }
};

/**
 * Shows the status after a particular stop.
 * @param {string} id id of the stop (see SantaLocation)
 * @param {string} msg message id
 * @return {SpecialStatus}
 */
StatusPicker.after = function(id, msg) {
  return function(state) {
    return (state.prev.id == id) ? this[msg] : null;
  }
};

/**
 * A special status that is shown near Santa's takeoff.
 * @param {string} msg message id
 * @return {SpecialStatus}
 */
StatusPicker.nearTakeoff = function(msg) {
  return function(state, rand) {
    return (state.prev.id == "takeoff" && rand < .3) ? this[msg] : null;
  }
};

/**
 * @param {string} msg message id
 * @return {SpecialStatus}
 */
StatusPicker.nearLanding = function(msg) {
  return function(state, rand) {
    return (state.next.id == "landing" && rand < .3) ? this[msg] : null;
  }
};

/**
 * Special messages that are shown based on some custom condition.
 * @type {!Array.<!SpecialStatus>}
 */
StatusPicker.SPECIAL_ = [
  StatusPicker.nearTakeoff('getting_started'),
  StatusPicker.nearTakeoff('bundled'),
  StatusPicker.nearTakeoff('checking'),
  StatusPicker.nearLanding('stocking_up'),
  StatusPicker.nearLanding('going_back'),
  StatusPicker.nearLanding('tired'),
  StatusPicker.after('new_york', 'liberty'),
  StatusPicker.after('london', 'cookies2'),
  StatusPicker.after('los_angeles', 'surf'),
  StatusPicker.after('sydney', 'surf'),
  StatusPicker.after('waipahu', 'surf'),
  StatusPicker.after('hilo', 'surf'),
  StatusPicker.after('nome_alaska', 'shirt'),
  StatusPicker.after('pyramids', 'pyramids'),
  StatusPicker.after('anadyr', 'dashing'),
  StatusPicker.after('bambari', 'snack'),
  //Around Hawaii show "warm"; avoid showing other random messages...
  StatusPicker.nearLatLng(/** @type {!LatLng} */({ lat: 20.804858, lng: -156.337974 }),
                          500000, 'warm'),
  // Around Canada
  StatusPicker.nearLatLng(/** @type {!LatLng} */({ lat: 56.13, lng: -106.3 }),
                          500000, 'mittens'),
  function(state) {
    // northern latitudes
    return (state.position.lat > 60) ? this['cold'] : null;
  },
  function(state) {
    // southern latitudes
    return (state.position.lat < -60) ? this['warm'] : null;
  }
];

/**
 * IDs for messages that can be shown at any time.
 * @const
 */
StatusPicker.NORMAL_ = [
  'bells',
  'carrots',
  'chimneys',
  'cookies1',
  'cookies3',
  'cookies4',
  'excited',
  'fast',
  'good',
  'happy_holidays',
  'hat',
  'hohoho1',
  'hohoho2',
  'hot_choc',
  'jingling',
  'joy',
  'magic',
  'on_track',
  'red',
  'sleigh',
  'smiling',
  'thirsty'
];
