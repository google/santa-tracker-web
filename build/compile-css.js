
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const sass = require('sass');

/**
 * This is an explicitly sync function to compile SASS => CSS with autoprefixer.
 *
 * It needs to be sync as it might be called as part of a Babel plugin, which cannot be async.
 *
 * @param {string} filename with .css extension to request
 * @param {boolean} compile whether to properly compile (autoprefixer)
 * @return {string}
 */
module.exports = (filename, compile=false) => {
  const ext = path.extname(filename);
  let css;

  // See if this is an _actual_ CSS file that needs to be compiled.
  if (ext === '.css') {
    try {
      css = fs.readFileSync(filename, 'utf8');
    } catch (e) {
      // fine
    }
  }

  // Otherwise, assume this is SASS and compile accordingly.
  if (css === undefined) {
    // nb. uses renderSync, https://sass-lang.com/dart-sass is adamant it's 2x faster
    const sassOptions = {
      file: filename.substr(0, filename.length - ext.length) + '.scss',
    };
    if (compile) {
      sassOptions.outputStyle = 'compressed';
    }
    css = sass.renderSync(sassOptions).css;
  }

  // Optionally apply autoprefixer for release.
  if (compile) {
    const result = postcss([autoprefixer]).process(css, {from: filename});
    result.warnings().forEach((warn) => {
      console.warn(warn.toString());
    });
    css = result.css.toString();
  }

  return css;
};
