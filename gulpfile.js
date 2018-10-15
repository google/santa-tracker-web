const gulp = require('gulp');
const server = new (require('koa'))();
const koaStatic = require('koa-static');
const jsTransform = require('./js-transform.js');
const cssTransform = require('./css-transform.js');

exports.serve = async function serve() {
  server.use(jsTransform);
  server.use(cssTransform);
  server.use(async (ctx, next) => {
    const simplePathMatch = /^\/(\w+)\.html(|\?.*)$/.exec(ctx.url);
    if (simplePathMatch) {
      ctx.url = '/index.html';
    }
    return next();
  });
  server.use(koaStatic('.'));

  const PORT = process.env.PORT || 5000;
  await new Promise((resolve) => {
    server.listen(PORT, resolve);
  });
  console.log(`App listening on :${PORT}`);
  console.log('Press Ctrl+C to quit.');
};

exports.default = gulp.parallel(exports.serve);