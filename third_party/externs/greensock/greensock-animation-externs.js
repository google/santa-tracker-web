/**
 * @fileoverview Externs for the easeljs
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.events.EventDispatcher}
 * @param {number=} duration
 * @param {Object=} vars
 */
com.greensock.core.Animation = function(duration, vars) {};

/**
 * @type {*}
 */
com.greensock.core.Animation.prototype.data;

/**
 * @type {com.greensock.Ticker}
 */
com.greensock.core.Animation.ticker;


/**
 * @type {com.greensock.core.SimpleTimeline}
 */
com.greensock.core.Animation.prototype.timeline;


/**
 * @type {Object}
 */
com.greensock.core.Animation.prototype.vars;

/**
 * @param {number} value
 * @return {*}
 */
com.greensock.core.Animation.prototype.delay = function(value) {};
 	
/**
 * @param {number} value
 * @return {*}
 */ 	
com.greensock.core.Animation.prototype.duration = function(value) {};

/**
 * @param {string} type
 * @param {Function=} callback
 * @param {Object=} params
 * @param {*=} scope
 * @return {*}
 */
com.greensock.core.Animation.prototype.eventCallback = function(type, callback, params, scope) {};

/**
 * @return {*}
 */
com.greensock.core.Animation.prototype.invalidate = function() {};

/**
 * @param {Object=} vars
 * @param {Object=} target
 * @return {*}
 */
com.greensock.core.Animation.prototype.kill = function(vars, target) {};

/**
 * @param {*=} atTime
 * @param {boolean=} suppressEvents
 * @return {*}
 */
com.greensock.core.Animation.prototype.pause = function(atTime, suppressEvents) {};

/**
 * @param {boolean=} value
 * @return {*}
 */
com.greensock.core.Animation.prototype.paused = function(value) {};

/**
 * @param {*=} from
 * @param {boolean=} suppressEvents
 * @return {*}
 */
com.greensock.core.Animation.prototype.play = function(from, suppressEvents) {};

/**
 * @param {boolean=} includeDelay
 * @param {boolean=} suppressEvents
 * @return {*}
 */
com.greensock.core.Animation.prototype.restart = function(includeDelay, suppressEvents) {};

/**
 * @param {*=} from
 * @param {boolean=} suppressEvents
 * @return {*}
 */
com.greensock.core.Animation.prototype.resume = function(from, suppressEvents) {};

/**
 * @param {*=} from
 * @param {boolean=} suppressEvents
 * @return {*}
 */
com.greensock.core.Animation.prototype.reverse = function(from, suppressEvents) {};

/**
 * @param {boolean=} value
 * @return {*}
 */
com.greensock.core.Animation.prototype.reversed = function(value) {};

/**
 * @param {*=} time
 * @param {boolean=} suppressEvents
 * @return {*}
 */
com.greensock.core.Animation.prototype.seek = function(time, suppressEvents) {};

/**
 * @param {number=} value
 * @return {*}
 */
com.greensock.core.Animation.prototype.startTime = function(value) {};

/**
 * @param {number=} value
 * @param {boolean=} suppressEvents
 * @return {*}
 */
com.greensock.core.Animation.prototype.time = function(value, suppressEvents) {};

/**
 * @param {number=} value
 * @return {*}
 */
com.greensock.core.Animation.prototype.timeScale = function(value) {};

/**
 * @param {number=} value
 * @return {*}
 */
com.greensock.core.Animation.prototype.totalDuration = function(value) {};

/**
 * @param {number=} time
 * @param {boolean=} suppressEvents
 * @return {*}
 */
com.greensock.core.Animation.prototype.totalTime = function(time, suppressEvents) {};