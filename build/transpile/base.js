/**
 * @fileoverview Minimal version of Closure's base.js for Santa scene transpilation inside ES6
 * module contexts.
 *
 * This MUST be named `base.js` and contain the annotation below to be detected and used. It must
 * also declare 'COMPILED' below.
 *
 * @provideGoog
 */


/**
 * @define {boolean} Never changed by the compiler, as this is used for transpilation only.
 */
var COMPILED = false;


var global = window;
var $jscomp = {global: global};

$jscomp.inherits = function(c, p) {
  c.prototype = Object.create(p.prototype);
  c.prototype.constructor = c;
  Object.setPrototypeOf(c, p);
};

/**
 * @param {string} v
 * @return {boolean} whether the variable named v is defined in global scope
 */
function _check(v) {
  try {
    window.eval(v);
  } catch (e) {
    return false;
  }
  return true;
}

var goog = goog || {};

goog.provide = function(v) {
  var all = v.split('.');
  var run = '';
  if (!_check(all[0])) {
    run += 'var ' + all[0] + '= {};';
  }
  for (var i = 2; i < all.length+1; ++i) {
    var part = all.slice(0, i).join('.');
    run += part + '=' + part + '||{};';
  }
  window.eval(run);
};

goog.require = function() {};
