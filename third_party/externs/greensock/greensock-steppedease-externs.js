/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.easing.Ease}
 * @param {number} steps
 */
com.greensock.easing.SteppedEase = function(steps) {};

/**
 * @param {number} steps
 * @return {com.greensock.easing.SteppedEase}
 */
com.greensock.easing.SteppedEase.config = function(steps) {};

/**
 * @param {number} p
 * @return {number}
 * @override
 */
com.greensock.easing.SteppedEase.prototype.getRatio = function(p) {};