const path = require('path');
const fsp = require('./build/fsp.js');
const sass = require('sass');

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