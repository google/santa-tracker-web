/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.core.Animation}
 * @param {Object} target
 * @param {number} duration
 * @param {Object} vars
 */
com.greensock.TweenLite = function(target, duration, vars) {};

/**
 * @type {com.greensock.easing.Ease}
 */
com.greensock.TweenLite.defaultEase;

/**
 * @type {string}
 */
com.greensock.TweenLite.defaultOverwrite;

/**
 * @type {com.greensock.Ticker}
 */
com.greensock.TweenLite.ticker;


/**
 * @type {Object}
 */
com.greensock.TweenLite.prototype.target;

/**
 * @param {number} delay
 * @param {Function} callback
 * @param {Object=} params
 * @param {*=} scope
 * @param {boolean=} useFrames
 * @return {com.greensock.TweenLite}
 */
com.greensock.TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} vars
 * @return {com.greensock.TweenLite}
 */
com.greensock.TweenLite.from = function(target, duration, vars) {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} fromVars
 * @param {Object} toVars
 * @return {com.greensock.TweenLite}
 */
com.greensock.TweenLite.fromTo = function(target, duration, fromVars, toVars) {};

/**
 * @param {*} target
 * @return {Object}
 */
com.greensock.TweenLite.getTweensOf = function(target) {};

/**
 * @param {Function} func
 */
com.greensock.TweenLite.killDelayedCallsTo = function(func) {};

/**
 * @param {*} target
 * @param {Object=} vars
 */
com.greensock.TweenLite.killTweensOf = function(target, vars) {};

/**
 * @param {Object} target
 * @param {Object} vars
 * @return {com.greensock.TweenLite}
 */
com.greensock.TweenLite.set = function(target, vars) {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} vars
 * @return {com.greensock.TweenLite}
 */
com.greensock.TweenLite.to = function(target, duration, vars) {};