#!/usr/bin/env node

const colors = require('ansi-colors');
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
      describe: 'Always compile Closure scenes',
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
  server.use(loaderTransform(loader));
  server.use(koaStatic('.'));

  await listen(server, yargs.port);
  log(`=> ${colors.blue(`http://localhost:${yargs.port}`)}`);

  const prod = new Koa();
  prod.use(async (ctx, next) => {
    const simplePathMatch = /^\/(\w+)\.html$/.exec(ctx.path);
    if (simplePathMatch) {
      const cand = path.join('prod', `${simplePathMatch[1]}.html`);
      if (await fsp.exists(cand)) {
        // do nothing, serve error/cast pages
      } else {
        ctx.url = '/index.html';
      }
    }
    return next();
  });
  prod.use(koaStatic('prod'));

  await listen(prod, yargs.port + 1);
  log(`=> ${colors.blue(`http://localhost:${yargs.port + 1}`)} prod`);
}

serve().catch((err) => {
  console.warn(err);
  process.exit(1);
});
