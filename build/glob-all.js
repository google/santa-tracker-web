const glob = require('glob');

module.exports = (...req) => {
  const out = new Set();

  for (let cand of req) {
    const negate = cand[0] === '!';
    if (negate) {
      cand = cand.substr(1);
    }

    const result = glob.sync(cand);
    if (!result.length && !glob.hasMagic(cand)) {
      throw new Error(`couldn't match file: ${cand}`);
    }

    for (const each of result) {
      negate ? out.delete(each) : out.add(each);
    }
  }

  return [...out];
};