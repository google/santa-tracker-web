/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.TimelineLite}
 * @param {Object=} vars
 */
com.greensock.TimelineMax = function(vars) {};

/**
 * @param {Function} callback
 * @param {*} timeOrLabel
 * @param {Object=} params
 * @param {*=} scope
 * @return {com.greensock.TimelineMax}
 */
com.greensock.TimelineMax.prototype.addCallback = function(callback, timeOrLabel, params, scope) {};

/**
 * @param {string=} value
 * @return {*}
 */
com.greensock.TimelineMax.prototype.currentLabel = function(value) {};

/**
 * @param {boolean=} nested
 * @param {boolean=} tweens
 * @param {boolean=} timelines
 * @return {Object}
 */
com.greensock.TimelineMax.prototype.getActive = function(nested, tweens, timelines) {};

/**
 * @param {number} time
 * @return {string}
 */
com.greensock.TimelineMax.prototype.getLabelAfter = function(time) {};

/**
 * @param {number} time
 * @return {string}
 */
com.greensock.TimelineMax.prototype.getLabelBefore = function(time) {};

/**
 * @return {Object}
 */
com.greensock.TimelineMax.prototype.getLabelsArray = function() {};

/**
 * @return {*}
 * @override
 */
com.greensock.TimelineMax.prototype.invalidate = function() {};

/**
 * @param {number} value
 * @return {*}
 * @override
 */
com.greensock.TimelineMax.prototype.progress = function(value) {};

/**
 * @param {Function} callback
 * @param {*=} timeOrLabel
 * @return {com.greensock.TimelineMax}
 */
com.greensock.TimelineMax.prototype.removeCallback = function(callback, timeOrLabel) {};

/**
 * @param {number=} value
 * @return {*}
 */
com.greensock.TimelineMax.prototype.repeat = function(value) {};

/**
 * @param {number=} value
 * @return {*}
 */
com.greensock.TimelineMax.prototype.repeatDelay = function(value) {};

/**
 * @param {number=} value
 * @param {boolean=} suppressEvents
 * @return {*}
 * @override
 */
com.greensock.TimelineMax.prototype.time = function(value, suppressEvents) {};

/**
 * @param {number=} value
 * @return {*}
 * @override
 */
com.greensock.TimelineMax.prototype.totalDuration = function(value) {};

/**
 * @param {number} value
 * @return {*}
 */
com.greensock.TimelineMax.prototype.totalProgress = function(value) {};

/**
 * @param {*} fromTimeOrLabel
 * @param {*} toTimeOrLabel
 * @param {Object=} vars
 * @return {com.greensock.TweenLite}
 */
com.greensock.TimelineMax.prototype.tweenFromTo = function(fromTimeOrLabel, toTimeOrLabel, vars) {};

/**
 * @param {*} timeOrLabel
 * @param {Object=} vars
 * @return {com.greensock.TweenLite}
 */
com.greensock.TimelineMax.prototype.tweenTo = function(timeOrLabel, vars) {};

/**
 * @param {boolean=} value
 * @return {*}
 */
com.greensock.TimelineMax.prototype.yoyo = function(value) {};