/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {com.greensock.events.EventDispatcher}
 */
com.greensock.Ticker = function() {};

/**
 * @type {number}
 */
com.greensock.TweenLite.prototype.frame;

/**
 * @type {number}
 */
com.greensock.TweenLite.prototype.time;

/**
 * @param {number} value
 */
com.greensock.Ticker.prototype.fps = function(value) {};

/**
 * 
 */
com.greensock.Ticker.prototype.sleep = function() {};

/**
 * 
 */
com.greensock.Ticker.prototype.tick = function() {};

/**
 * @param {boolean} value
 */
com.greensock.Ticker.prototype.useRAF = function(value) {};

/**
 * 
 */
com.greensock.Ticker.prototype.wake = function() {};