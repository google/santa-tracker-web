#!/usr/bin/env node

const chalk = require('chalk');
const clipboardy = require('clipboardy');
const compileHtml = require('./build/compile-html.js');
const fsp = require('./build/fsp.js');
const i18n = require('./build/i18n.js');
const santaVfs = require('./santa-vfs.js');
const modernLoader = require('./build/modern-loader.js');
const mimeTypes = require('mime-types');

const polka = require('polka');
const dhost = require('dhost');

const log = require('fancy-log');
const path = require('path');

const yargs = require('yargs')
    .strict()
    .epilogue('https://github.com/google/santa-tracker-web')
    .option('port', {
      alias: 'p',
      type: 'number',
      default: process.env.PORT || 8000,
      describe: 'Static port',
    })
    .option('lang', {
      type: 'string',
      default: 'en',
      describe: 'Serving language',
    })
    .option('compile', {
      type: 'boolean',
      default: false,
      describe: 'Compile complex dependencies',
    })
    .argv;

function listen(server, port) {
  return new Promise((r) => server.listen(port, 'localhost', r));
}

function clipboardCopy(v) {
  try {
    clipboardy.writeSync(v);
  } catch (e) {
    return e;
  }
  return null;
}

const messages = i18n(yargs.lang);
log(messages('santatracker'));

async function prod(req, res, next) {
  let servePath = 'index.html';

  const simplePathMatch = /^\/(\w+)\.html$/.exec(req.path);
  if (simplePathMatch) {
    const cand = `${simplePathMatch[1]}.html`;
    const exists = await fsp.exists(path.join('prod', cand));
    if (exists) {
      // load the top-level path if the file doesn't already exist (e.g. error/upgrade/cast)
      servePath = cand;
    }
  } else if (res.path !== '/') {
    return next();
  }

  // compile the HTML locally to include i18n and static URL
  const filename = path.join('prod', servePath);
  const options = {
    compile: yargs.compile,
    messages,
    body: {
      static: staticURL,
    },
  };

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(await compileHtml(filename, options));
}

async function serve() {
  const staticPrefix = 'static-test-1234';  // nb. Polka doesn't support this having /'s.
  const staticScope = `http://127.0.0.1:${yargs.port + 80}/${staticPrefix}/`;

  const vfs = santaVfs(staticScope, yargs.compile);
  // const rollupLoader = require('./rollup-loader.js')('static', vfs);
  // const loaderTransform = require('./loader-transform.js');

  const santaMiddleware = async (req, res, next) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',  // always CORS enabled
      'Expires': '0',
      'Cache-Control': 'no-store',
    };

    let filename = req.path.substr(1);
    if (filename.endsWith('/') || filename === '') {
      filename += 'index.html';
    }

    const id = path.join('./static', filename);
    const isModuleMode = Boolean(req.headers['origin']);

    // TODO: only read if valid entry point, otherwise defer to dhost
    let content = null;
    let virtual = false;
    try {
      content = await fsp.readFile(id, 'utf-8');
    } catch (e) {
      content = await vfs.load(id);  // try vfs
      virtual = (content !== null);
    }

    if (!isModuleMode) {
      if (!virtual) {
        // FIXME: By this point, we've loaded the file: serve it?
        return next();  // defer to dhost, this is just a real file
      }

      // If this was a regular fetch of a virtual file, just serve it (generated CSS/JS/etc).
      // TODO: insert sourceMap
      const raw = (typeof content === 'string') ? content : content.code;
      const mimeType = mimeTypes.lookup(filename);
      if (mimeType) {
        headers['Content-Type'] = mimeType;
      }
      res.writeHead(200, headers);
      return res.end(raw);
    }

    // Ask our loader to rewrite this single file (virtual or not is moot here).
    const result = await modernLoader(id, content);
    if (result === null) {
      res.writeHead(500, headers);
      return res.end();
    }

    headers['Content-Type'] = 'application/javascript';
    res.writeHead(200, headers);
    return res.end(result.code);
  };

  const staticHost = dhost({
    path: 'static',
    cors: true,
    serveLink: true,
  });
  const staticServer = polka();
  staticServer.use(staticPrefix, /*loaderTransform(rollupLoader)*/ santaMiddleware, staticHost);

  await listen(staticServer, yargs.port + 80);
  log('Static', chalk.green(staticScope));

  const prodServer = polka();
  prodServer.use(prod);
  prodServer.use(dhost({path: 'prod', listing: false}));

  // listen, copy and announce prod URL
  await listen(prodServer, yargs.port);
  const prodURL = `http://localhost:${yargs.port}`;
  const clipboardError = clipboardCopy(prodURL);
  const suffix = clipboardError ? chalk.red('(could not copy to clipboard)') : chalk.dim('(on your clipboard!)');
  log('Prod', chalk.greenBright(prodURL), suffix);
}

serve().catch((err) => {
  console.warn(err);
  process.exit(1);
});
