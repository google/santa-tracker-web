goog.provide('Random');

Random.generator_ = null;

Random.mulberry32 = function(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
};

/**
 * Robust 32-bit seed hash function using FNV-1a and fmix32 finalizer.
 * @param {string|number} seed
 * @return {number} Unsigned 32-bit integer seed.
 */
Random.hashSeed = function(seed) {
  var h = 0x811c9dc5;
  if (typeof seed === 'string') {
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
  } else {
    h ^= seed | 0;
    h = Math.imul(h, 0x01000193);
  }
  // fmix32 finalization step for full bit mixing
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};

Random.setSeed = function(seed) {
  var numericSeed = Random.hashSeed(seed);
  Random.generator_ = Random.mulberry32(numericSeed);
};

/**
 * Returns a pseudo-random number in [0, 1).
 *
 * If no seed has been set yet, seeds from `window.__RANDOM_SEED__` when
 * defined (tests set this from an init script so that randomness consumed
 * while a scene is being constructed is deterministic), otherwise from
 * Math.random().
 * @return {number}
 */
Random.random = function() {
  if (!Random.generator_) {
    var initialSeed = window['__RANDOM_SEED__'];
    Random.setSeed(initialSeed !== undefined ? initialSeed :
        Math.floor(Math.random() * 1000000));
  }
  return Random.generator_();
};

window['Random'] = Random;

