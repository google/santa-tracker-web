/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.plugins.TweenPlugin}
 */
com.greensock.plugins.BezierPlugin  = function() {};

/**
 * @param {Object} values
 * @param {number=} curviness
 * @param {boolean=} quadratic
 * @param {string=} correlate
 * @param {Object=} prepend
 * @param {boolean=} calcDifs
 * @return {Object}
 */
com.greensock.plugins.BezierPlugin.bezierThrough = function(values, curviness, quadratic, correlate, prepend, calcDifs) {};

/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @return {Object}
 */
com.greensock.plugins.BezierPlugin.cubicToQuadratic = function(a, b, c, d) {};

/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @return {Object}
 */
com.greensock.plugins.BezierPlugin.quadraticToCubic = function(a, b, c) {};