
const autoprefixer = require('autoprefixer');
const fsp = require('./fsp.js');
const path = require('path');
const postcss = require('postcss');
const sass = require('sass');

module.exports = async (filename, opts={}) => {
  const ext = path.extname(filename);

  let css;
  if (ext === '.css') {
    try {
      css = await fsp.readFile(`.${ctx.url}`, 'utf8');
    } catch (e) {
      // fine
    }
  }

  if (css === undefined) {
    // nb. uses renderSync, https://sass-lang.com/dart-sass is adamant it's 2x faster
    const sassOptions = {
      file: filename.substr(0, filename.length - ext.length) + '.scss',
    };
    if (opts.compile) {
      sassOptions.outputStyle = 'compressed';
    }
    css = sass.renderSync(sassOptions).css;
  }

  if (!opts.compile) {
    return css;
  }

  const result = await postcss([autoprefixer]).process(css, {
    from: filename,
  });
  result.warnings().forEach((warn) => {
    console.warn(warn.toString());
  });
  return result.css;
};
