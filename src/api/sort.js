

/**
 * @template T
 * @param {!Array<T>} all 
 * @param {number} valueToFind 
 * @param {function(T): number} fn 
 * @return {number}
 */
export function bisectLeft(all, valueToFind, fn) {
  let low = 0, high = all.length;
  while (low < high) {
    const mid = ~~((low + high) / 2);
    const valueOfItem = fn(all[mid]);
    if (valueOfItem < valueToFind) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}
