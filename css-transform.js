const path = require('path');
const fs = require('fs');
const util = require('util');

const sass = require('sass');

const fsp = {
  readFile: util.promisify(fs.readFile),
};

module.exports = async (ctx, next) => {
  const ext = path.extname(ctx.url);
  const match = (ext === '.css');
  if (!match) {
    return next();
  }

  let css;
  try {
    css = await fsp.readFile(`.${ctx.url}`, 'utf8');
  } catch (e) {
    // fine
  }

  if (!css) {
    // nb. use renderSync, https://sass-lang.com/dart-sass is adamant it's 2x faster
    const result = sass.renderSync({file: `.${ctx.url.substr(0, ctx.url.length - 4)}.scss`});
    css = result.css;
  }

  ctx.response.type = 'text/css';
  ctx.response.body = css;
};