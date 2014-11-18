/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.core.Animation}
 * @param {Object} vars
 */
com.greensock.core.SimpleTimeline = function(vars) {};

/**
 * @type {boolean}
 */
com.greensock.core.SimpleTimeline.prototype.autoRemoveChildren;

/**
 * @type {boolean}
 */
com.greensock.core.SimpleTimeline.prototype.smoothChildTiming;

/**
 * @param {*} tween
 * @param {*=} time
 * @return {*}
 */
com.greensock.core.SimpleTimeline.prototype.insert = function(tween, time) {};
 	 	
/**
 * @param {number} time
 * @param {boolean=} suppressEvents
 * @param {boolean=} force
 */
com.greensock.core.SimpleTimeline.prototype.render = function(time, suppressEvents, force) {};