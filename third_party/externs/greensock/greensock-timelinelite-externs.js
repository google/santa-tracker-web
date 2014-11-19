/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.core.SimpleTimeline}
 * @param {Object=} vars
 */
com.greensock.TimelineLite = function(vars) {};

/**
 * @param {string} label
 * @param {number} time
 * @return {*}
 */
com.greensock.TimelineLite.prototype.addLabel = function(label, time) {};

/**
 * @param {*} value
 * @param {number=} offset
 * @return {*}
 */
com.greensock.TimelineLite.prototype.append = function(value, offset) {};

/**
 * @param {Object} tweens
 * @param {number=} offset
 * @param {string=} align
 * @param {number=} stagger
 * @return {*}
 */
com.greensock.TimelineLite.prototype.appendMultiple = function(tweens, offset, align, stagger) {};

/**
 * @param {Function} callback
 * @param {Object=} params
 * @param {*=} scope
 * @param {number=} offset
 * @param {*=} baseTimeOrLabel
 * @return {*}
 */
com.greensock.TimelineLite.prototype.call = function(callback, params, scope, offset, baseTimeOrLabel) {}

/**
 * @param {boolean=} labels
 * @return {*}
 */
com.greensock.TimelineLite.prototype.clear = function(labels) {};

/**
 * @param {number} value
 * @return {*}
 * @override
 */
com.greensock.TimelineLite.prototype.duration = function(value) {};

/**
 * @param {Object=} vars
 * @param {boolean=} omitDelayedCalls
 * @return {com.greensock.TimelineLite}
 * @override
 */
com.greensock.TimelineLite.exportRoot = function(vars, omitDelayedCalls) {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} vars
 * @param {number=} offset
 * @param {*=} baseTimeOrLabel
 * @return {*}
 */
com.greensock.TimelineLite.prototype.from = function(target, duration, vars, offset, baseTimeOrLabel) {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} fromVars
 * @param {Object} toVars
 * @param {number=} offset
 * @param {*=} baseTimeOrLabel
 * @return {*}
 */
com.greensock.TimelineLite.prototype.fromTo = function(target, duration, fromVars, toVars, offset, baseTimeOrLabel) {};

/**
 * @param {boolean=} nested
 * @param {boolean=} tweens
 * @param {boolean=} timelines
 * @param {number=} ignoreBeforeTime
 * @return {Object}
 */
com.greensock.TimelineLite.prototype.getChildren = function(nested, tweens, timelines, ignoreBeforeTime) {};

/**
 * @param {string} label
 * @return {number}
 */
com.greensock.TimelineLite.prototype.getLabelTime = function(label) {}

/**
 * @param {Object} target
 * @param {boolean=} nested
 * @return {Object}
 */
com.greensock.TimelineLite.prototype.getTweensOf = function(target, nested) {};

/**
 * @param {*} value
 * @param {*=} timeOrLabel
 * @return {*}
 * @override
 */
com.greensock.TimelineLite.prototype.insert = function(value, timeOrLabel) {};

/**
 * @param {Object} tweens
 * @param {*=} timeOrLabel
 * @param {string=} align
 * @param {number=} stagger
 * @return {*}
 */
com.greensock.TimelineLite.prototype.insertMultiple = function(tweens, timeOrLabel, align, stagger) {};

/**
 * @return {*}
 * @override
 */
com.greensock.TimelineLite.prototype.invalidate = function() {};

/**
 * @param {number} value
 * @return {*}
 */
com.greensock.TimelineLite.prototype.progress = function(value) {};

/**
 * @param {*} value
 * @return {*}
 */
com.greensock.TimelineLite.prototype.remove = function(value) {};

/**
 * @param {string} label
 * @return {*}
 */
com.greensock.TimelineLite.prototype.removeLabel = function(label) {};

/**
 * @param {*=} timeOrLabel
 * @param {boolean=} suppressEvents
 * @return {*}
 * @override
 */
com.greensock.TimelineLite.prototype.seek = function(timeOrLabel, suppressEvents) {};

/**
 * @param {Object} target
 * @param {Object} vars
 * @param {number=} offset
 * @param {*=} baseTimeOrLabel
 * @return {*}
 */
com.greensock.TimelineLite.prototype.set = function(target, vars, offset, baseTimeOrLabel) {};

/**
 * @param {number} amount
 * @param {boolean=} adjustLabels
 * @param {number=} ignoreBeforeTime
 * @return {*}
 */	
com.greensock.TimelineLite.prototype.shiftChildren = function(amount, adjustLabels, ignoreBeforeTime) {};

/**
 * @param {Object} targets
 * @param {number} duration
 * @param {Object} vars
 * @param {number=} stagger
 * @param {number=} offset
 * @param {*=} baseTimeOrLabel
 * @param {Function=} onCompleteAll
 * @param {Object=} onCompleteAllParams
 * @param {*=} onCompleteAllScope
 * @return {*}
 */	
com.greensock.TimelineLite.prototype.staggerFrom = function(targets, duration, vars, stagger, offset, baseTimeOrLabel, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {}

/**
 * @param {Object} targets
 * @param {number} duration
 * @param {Object} fromVars
 * @param {Object} toVars
 * @param {number=} stagger
 * @param {number=} offset
 * @param {*=} baseTimeOrLabel
 * @param {Function=} onCompleteAll
 * @param {Object=} onCompleteAllParams
 * @param {*=} onCompleteAllScope
 * @return {*}
 */	
com.greensock.TimelineLite.prototype.staggerFromTo = function(targets, duration, fromVars, toVars, stagger, offset, baseTimeOrLabel, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {};

/**
 * @param {Object} targets
 * @param {number} duration
 * @param {Object} vars
 * @param {number} stagger
 * @param {number=} offset
 * @param {*=} baseTimeOrLabel
 * @param {Function=} onCompleteAll
 * @param {Object=} onCompleteAllParams
 * @param {*=} onCompleteAllScope
 * @return {*}
 */	
com.greensock.TimelineLite.prototype.staggerTo = function(targets, duration, vars, stagger, offset, baseTimeOrLabel, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {};

/**
 * @return {*}
 */	
com.greensock.TimelineLite.prototype.stop = function() {};

/**
 * @param {Object} target
 * @param {number} duration
 * @param {Object} vars
 * @param {number=} offset
 * @param {*=} baseTimeOrLabel
 * @return {*}
 */	
com.greensock.TimelineLite.prototype.to = function(target, duration, vars, offset, baseTimeOrLabel) {};

/**
 * @param {number=} value
 * @return {*}
 * @override
 */	
com.greensock.TimelineLite.prototype.totalDuration = function(value) {};

/**
 * @return {boolean}
 */	
com.greensock.TimelineLite.prototype.usesFrames = function() {};