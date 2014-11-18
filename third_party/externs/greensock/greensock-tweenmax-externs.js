/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.TweenLite}
 * @param {Object} target
 * @param {number} duration
 * @param {Object} vars
 */
com.greensock.TweenMax = function(target, duration, vars) {};

/**
 * @type {com.greensock.Ticker}
 */
com.greensock.TweenMax.ticker;

/**
 * @param {number} delay
 * @param {Function} callback
 * @param {Object=} params
 * @param {*=} scope
 * @param {boolean=} useFrames
 * @return {com.greensock.TweenMax}
 */
com.greensock.TweenMax.delayedCall = function(delay, callback, params, scope, useFrames) {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} vars
 * @return {com.greensock.TweenMax}
 */
com.greensock.TweenMax.from = function(target, duration, vars) {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} fromVars
 * @param {Object} toVars
 * @return {com.greensock.TweenMax}
 */
com.greensock.TweenMax.fromTo = function(target, duration, fromVars, toVars) {};

/**
 * @param {boolean=} includeTimelines
 * @return {Object}
 */
com.greensock.TweenMax.getAllTweens = function(includeTimelines) {};

/**
 * @param {*} target
 * @return {Object}
 */
com.greensock.TweenMax.getTweensOf = function(target) {};

/**
 * @param {Object} target
 * @return {boolean}
 */
com.greensock.TweenMax.isTweening = function(target) {};

/**
 * @param {boolean=} complete
 * @param {boolean=} tweens
 * @param {boolean=} delayedCalls
 * @param {boolean=} timelines
 */
com.greensock.TweenMax.killAll = function(complete, tweens, delayedCalls, timelines) {};

/**
 * @param {Object} parent
 * @param {boolean=} complete
 */
com.greensock.TweenMax.killChildTweensOf = function(parent, complete) {};

/**
 * @param {Function} func
 */
com.greensock.TweenMax.killDelayedCallsTo = function(func) {};

/**
 * @param {*} target
 * @param {Object=} vars
 */
com.greensock.TweenMax.killTweensOf = function(target, vars) {};

/**
 * @param {boolean=} tweens
 * @param {boolean=} delayedCalls
 * @param {boolean=} timelines
 */
com.greensock.TweenMax.pauseAll = function(tweens, delayedCalls, timelines) {};

/**
 * @param {number} value
 * @return {*}
 */
com.greensock.TweenMax.prototype.progress = function(value) {};

/**
 * @param {number=} value
 * @return {*}
 */
com.greensock.TweenMax.prototype.repeat = function(value) {}

/**
 * @param {number} value
 * @return {*}
 */
com.greensock.TweenMax.prototype.repeatDelay = function(value) {};

/**
 * @param {boolean=} tweens
 * @param {boolean=} delayedCalls
 * @param {boolean=} timelines
 */
com.greensock.TweenMax.resumeAll = function(tweens, delayedCalls, timelines) {};

/**
 * @param {Object} target
 * @param {Object} vars
 * @return {com.greensock.TweenMax}
 */
com.greensock.TweenMax.set = function(target, vars) {};

/**
 * @param {Object} targets
 * @param {number} duration
 * @param {Object} vars
 * @param {number=} stagger
 * @param {Function=} onCompleteAll
 * @param {Object=} onCompleteAllParams
 * @param {*=} onCompleteAllScope
 * @return {Object}
 */
com.greensock.TweenMax.staggerFrom = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {};

/**
 * @param {Object} targets
 * @param {number} duration
 * @param {Object} fromVars
 * @param {Object} toVars
 * @param {number=} stagger
 * @param {Function=} onCompleteAll
 * @param {Object=} onCompleteAllParams
 * @param {*=} onCompleteAllScope
 * @return {Object}
 */
com.greensock.TweenMax.staggerFromTo = function(targets, duration, fromVars, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {};

/**
 * @param {Object} targets
 * @param {number} duration
 * @param {Object} vars
 * @param {number=} stagger
 * @param {Function=} onCompleteAll
 * @param {Object=} onCompleteAllParams
 * @param {*=} onCompleteAllScope
 * @return {Object}
 */
com.greensock.TweenMax.staggerTo = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} vars
 * @return {com.greensock.TweenMax}
 */
com.greensock.TweenMax.to = function(target, duration, vars) {};

/**
 * @param {number} value
 * @return {*}
 */
com.greensock.TweenMax.prototype.totalProgress = function(value) {};

/**
 * @param {Object} vars
 * @param {boolean=} resetDuration
 * @return {*}
 */
com.greensock.TweenMax.prototype.updateTo = function(vars, resetDuration) {};

/**
 * @param {boolean=} value
 * @return {*}
 */
com.greensock.TweenMax.prototype.yoyo = function(value) {};