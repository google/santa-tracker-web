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
 * @param {{compile: boolean, root: string}} options
 * @return {{css: string, map: !Object}}
 */
module.exports = (filename, options) => {
  const ext = path.extname(filename);
  let css;
  let map = null;

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
    const functions = {
      '_root($url)': (url) => {
        // This places the URL at the root of the static output.
        const raw = path.join(options.root || '/', url.getValue());
        if (raw.indexOf('(') !== -1 || raw.indexOf(')') !== -1) {
          throw new Error(`got unexpected char in URL: ${raw}`);
        }
        return new sass.types.String(`url(${raw})`);
      },
    };

    // nb. uses renderSync, https://sass-lang.com/dart-sass is adamant it's 2x faster
    const sassOptions = {
      file: filename.substr(0, filename.length - ext.length) + '.scss',
      sourceMap: true,
      sourceMapContents: true,
      omitSourceMapUrl: true,
      sourceMapEmbed: false,
      sourceMapRoot: '.',
      outFile: '_.css',  // just used for relative paths
      functions,
    };
    if (options.compile) {
      sassOptions.outputStyle = 'compressed';
    }
    const out = sass.renderSync(sassOptions);

    if (out.map) {
      map = JSON.parse(out.map.toString());

      // The compiler likes to give absolute paths like file:///Users/foo/...., so make them
      // relative to the current working dir.
      map.sources = map.sources.map((source) => {
        if (source.startsWith('file://')) {
          return source.substr(7);
        }
        return source;
      });
    }

    css = out.css;
  }

  // Optionally apply autoprefixer for release.
  if (options.compile) {
    const result = postcss([autoprefixer]).process(css, {from: filename});
    result.warnings().forEach((warn) => {
      console.warn(warn.toString());
    });
    css = result.css.toString();
  }

  return {css, map};
};
