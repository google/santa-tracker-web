/**
 * @fileoverview Externs for the greensock
 * @externs
 */

/**
 * @constructor
 * @extends {Object}
 */
com.greensock.events.EventDispatcher = function() {};

/**
 * @param {string} type
 * @param {Function|Object} callback
 * @param {Object} scope
 * @param {*=} useParam
 * @param {number=} priority
 */
com.greensock.events.EventDispatcher.prototype.addEventListener = function(type, callback, scope, useParam, priority) {};

/**
 * @param {string} type
 * @param {Function|Object} callback
 */
com.greensock.events.EventDispatcher.prototype.removeEventListener = function(type, callback) {};

/**
 * @param {string} type
 */
com.greensock.events.EventDispatcher.prototype.dispatchEvent = function(type) {};