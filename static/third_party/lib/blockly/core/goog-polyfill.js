'use strict';

goog.provide('Blockly.goog');

/**
 * Re-adds functions that were deleted from goog.
 * These are polyfills for Closure Library's goog.is* functions.
 */

/**
 * Returns true if the specified value is not undefined.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
Blockly.goog.isDef = function(val) {
  return val !== void 0;
};

/**
 * Returns true if the specified value is `null`.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
Blockly.goog.isNull = function(val) {
  return val === null;
};

/**
 * Returns true if the specified value is defined and not null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
Blockly.goog.isDefAndNotNull = function(val) {
  return val != null;
};

/**
 * Returns true if the specified value is a string.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
Blockly.goog.isString = function(val) {
  return typeof val == 'string';
};

/**
 * Returns true if the specified value is a boolean.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a boolean.
 */
Blockly.goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};

/**
 * Returns true if the specified value is a number.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
Blockly.goog.isNumber = function(val) {
  return typeof val == 'number';
};

/**
 * Returns true if the specified value is a function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
Blockly.goog.isFunction = function(val) {
  return typeof val == 'function';
};

/**
 * Returns true if the specified value is an array.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
Blockly.goog.isArray = function(val) {
  return Array.isArray(val);
};