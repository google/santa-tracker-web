const path = require('path');
const glob = require('glob');

/**
 * Performs a synchronous glob over all requests, supporting Closure's negation syntax. e.g.:
 *   'foo*', '!foo-bar' => returns all `foo*` but not `foo-bar`
 *
 * If a non-magic glob (i.e., no * or glob charaters) doesn't match a file, then this method
 * throws Error.
 *
 * @param {...string} req
 * @return {!Array<string>}
 */
module.exports = (...req) => {
  const out = new Set();
  const options = {mark: true};

  for (let cand of req) {
    const negate = cand[0] === '!';
    if (negate) {
      cand = cand.substr(1);
    }

    const result = glob.sync(cand, options);
    if (!result.length && !glob.hasMagic(cand)) {
      throw new Error(`couldn't match file: ${cand}`);
    }

    for (const each of result) {
      negate ? out.delete(each) : out.add(each);
    }
  }

  // filter out directories
  return [...out].filter((cand) => !cand.endsWith('/'));
};
