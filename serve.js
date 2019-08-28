#!/usr/bin/env node

const chalk = require('chalk');
const clipboardy = require('clipboardy');
const compileHtml = require('./build/compile-html.js');
const fs = require('fs').promises;
const i18n = require('./build/i18n.js');
const santaVfs = require('./santa-vfs.js');
const vfsMiddleware = require('./build/modern-vfs-middleware.js');


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


const staticPrefix = 'st';  // nb. Polka doesn't support this having /'s.
const staticScope = `http://127.0.0.1:${yargs.port + 80}/${staticPrefix}/`;
const config = {
  staticScope,
  version: `dev-${(new Date).toISOString().replace(/[^\d]/g, '')}`,
};

async function serve() {
  const vfs = santaVfs(staticScope, yargs.compile);

  const staticHost = dhost({
    path: 'static',
    cors: true,
    serveLink: true,
  });
  const staticServer = polka();
  staticServer.use(staticPrefix, vfsMiddleware(vfs, 'static'), staticHost);

  await listen(staticServer, yargs.port + 80);
  log('Static', chalk.green(staticScope));

  const prodServer = polka();
  const prodVfs = (id) => {
    if (id === 'prod/config.json') {
      return JSON.stringify(config);
    }
  };

  const prodHtmlMiddleware = async (req, res, next) => {
    // Match Google's serving infrastructure, and serve valid files under /intl/XX/.
    const languageMatch = /^\/intl\/([-_\w]+)(\/|$)/.exec(req.path);
    if (languageMatch) {
      if (!languageMatch[2]) {
        // fix "/intl/xx" => "/intl/xx/"
        res.writeHead(301, {'Location': req.path + '/'});
        return res.end();
      }
      req.path = '/' + req.path.substr(languageMatch[0].length);
    }

    let servePath = 'index.html';
    const simplePathMatch = /^\/(\w+)\.html$/.exec(req.path);
    if (simplePathMatch) {
      const cand = `${simplePathMatch[1]}.html`;
      try {
        await fs.stat(path.join('prod', cand));
        servePath = cand;  // real file, serve instead of faux-"index.html"
      } catch (e) {
        // ignore, not a real file
      }
    } else if (req.path !== '/') {
      return next();
    }

    // Compile the HTML locally to include i18n.
    // TODO(samthor): Pair this down so it's less magical.
    const filename = path.join('prod', servePath);
    const options = {
      compile: yargs.compile,
      messages,
    };

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(await compileHtml(filename, options));
  };

  prodServer.use(
    prodHtmlMiddleware,
    vfsMiddleware(prodVfs, 'prod'),
    dhost({path: 'prod', listing: false}),
  );

  // Listen, copy and announce prod URL.
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
