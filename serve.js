#!/usr/bin/env node

const Koa = require('koa');
const koaStatic = require('koa-static');
const log = require('fancy-log');
const path = require('path');
const colors = require('ansi-colors');

const yargs = require('yargs')
    .strict()
    .epilogue('https://github.com/google/santa-tracker-web')
    .option('port', {
      alias: 'p',
      type: 'number',
      default: process.env.PORT || 5000,
      describe: 'Serving port',
    })
    .option('compile', {
      type: 'boolean',
      default: false,
      describe: 'Always compile Closure scenes',
    })
    .argv;

async function serve() {
  const server = new Koa();

  const loader = require('./loader.js');
  const loaderTransform = require('./loader-transform.js');

  server.use(loaderTransform(loader));

  server.use(async (ctx, next) => {
    const simplePathMatch = /^\/(\w+)\.html(|\?.*)$/.exec(ctx.url);
    if (simplePathMatch) {
      ctx.url = '/index.html';
    }
    return next();
  });
  server.use(koaStatic('.'));

  await new Promise((resolve) => server.listen(yargs.port, resolve));
  log(`Santa Tracker listening on ${colors.blue(`http://localhost:${yargs.port}`)}`);
}

serve().catch((err) => {
  console.warn(err);
  process.exit(1);
});
