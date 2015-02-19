goog.provide('app.utils');

/**
 * Generic shuffle function that shuffles an array.
 * @param {!Array} arr The array to be shuffled.
 */
app.utils.shuffleArray = function(arr) {
  var count = arr.length;
  for (var idx = 0; idx < count - 1; idx++) {
    var swap = idx + Math.floor(Math.random() * count - idx);
    var tmp = arr[idx];
    arr[idx] = arr[swap];
    arr[swap] = tmp;
  }
  return arr;
};
