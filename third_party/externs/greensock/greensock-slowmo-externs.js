/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.easing.Ease}
 * @param {number=} linearRatio
 * @param {number=} power
 * @param {boolean=} yoyoMode
 */
com.greensock.easing.SlowMo = function(linearRatio, power, yoyoMode) {};

/**
 * @type {Object}
 */
com.greensock.easing.SlowMo.ease;

/**
 * @param {number=} linearRatio
 * @param {number=} power
 * @param {boolean=} yoyoMode
 * @return {com.greensock.easing.SlowMo}
 */
com.greensock.easing.SlowMo.config = function(linearRatio, power, yoyoMode) {};

/**
 * @param {number} p
 * @return {number}
 * @override
 */
com.greensock.easing.SlowMo.prototype.getRatio = function(p) {};