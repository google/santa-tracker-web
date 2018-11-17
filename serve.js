#!/usr/bin/env node

const colors = require('ansi-colors');
const compileHtml = require('./build/compile-html.js');
const fsp = require('./build/fsp.js');
const Koa = require('koa');
const koaStatic = require('koa-static');
const log = require('fancy-log');
const path = require('path');

const yargs = require('yargs')
    .strict()
    .epilogue('https://github.com/google/santa-tracker-web')
    .option('port', {
      alias: 'p',
      type: 'number',
      default: process.env.PORT || 5000,
      describe: 'Serving port (+1 for prod)',
    })
    .option('compile', {
      type: 'boolean',
      default: false,
      describe: 'Compile dependencies',
    })
    .argv;

function listen(server, port) {
  return new Promise((resolve) => server.listen(port, resolve));
}

log('Santa Tracker');

async function serve() {
  const loader = require('./loader.js');
  const loaderTransform = require('./loader-transform.js');

  const server = new Koa();
  server.use(loaderTransform(loader({compile: yargs.compile})));
  server.use(koaStatic('.'));

  await listen(server, yargs.port);
  log(`=> ${colors.blue(`http://localhost:${yargs.port}`)}`);

  const prod = new Koa();
  prod.use(async (ctx, next) => {
    const simplePathMatch = /^\/(\w+)\.html$/.exec(ctx.path);
    if (simplePathMatch) {
      const sceneName = simplePathMatch[1];
      const exists = await fsp.exists(path.join('prod', `${sceneName}.html`));
      if (!exists) {
        // load the top-level path if the file doesn't already exist (e.g. error/upgrade/cast)
        ctx.url = '/index.html';
      }
    } else if (ctx.path === '/') {
      ctx.url = '/index.html';
    }

    if (path.extname(ctx.path) !== '.html') {
      return next();
    }

    // compile the HTML locally to include i18n and prod URL
    const filename = path.join('prod', ctx.path);
    const options = {compile: yargs.compile};
    if (ctx.path === '/index.html') {
      options.body = {static: `http://localhost:${yargs.port}/index.html`};
    }
    ctx.response.body = await compileHtml(filename, options);
    ctx.response.type = 'text/html';
  });
  prod.use(koaStatic('prod'));

  await listen(prod, yargs.port + 1);
  log(`=> ${colors.blue(`http://localhost:${yargs.port + 1}`)} prod`);
}

serve().catch((err) => {
  console.warn(err);
  process.exit(1);
});
