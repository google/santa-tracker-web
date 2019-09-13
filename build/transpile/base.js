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


/**
 * @param {string} v
 * @return {boolean} whether the variable named v is defined in global scope
 */
function _check(v) {
  try {
    self.eval(v);
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
  self.eval(run);
};

goog.require = function() {};

goog.scope = function(fn) {
  fn();
};


/*
 * nb. Fast transpiled helpers for ES6 features below this line. This is somewhat cribbed from
 * Closure's internal `--rewrite_polyfills` feature, which does not seem to run in WHITESPACE_ONLY
 * mode (and is sometimes too aggressive).
 */


var global = self;
var $jscomp = {global: global};

$jscomp.inherits = function(c, p) {
  c.prototype = Object.create(p.prototype);
  c.prototype.constructor = c;
  Object.setPrototypeOf(c, p);
};

goog.inherits = $jscomp.inherits;

$jscomp.arrayIteratorImpl = function(array) {
  var index = 0;
  return function() {
    if (index < array.length) {
      return {
        done: false,
        value: array[index++],
      };
    } else {
      return {done: true};
    }
  };
};

$jscomp.arrayIterator = function(array) {
  return /** @type {!Iterator<T>} */ ({next: $jscomp.arrayIteratorImpl(array)});
};

$jscomp.makeIterator = function(iterable) {
  // NOTE: Disabling typechecking because [] not allowed on @struct.
  var iteratorFunction = typeof Symbol != 'undefined' && Symbol.iterator &&
      (/** @type {?} */ (iterable)[Symbol.iterator]);
  return iteratorFunction ? iteratorFunction.call(iterable) :
      $jscomp.arrayIterator(/** @type {!Array} */ (iterable));
};
