#!/usr/bin/env node
/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const chalk = require('chalk');
const fs = require('fs').promises;
const i18n = require('./build/i18n.js');
const santaVfs = require('./santa-vfs.js');
const vfsMiddleware = require('./build/modern-vfs-middleware.js');


const polka = require('polka');
const dhost = require('dhost').default;

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
    .option('all', {
      alias: 'a',
      type: 'boolean',
      default: false,
      describe: 'Serve static on network address'
    })
    .option('prefix', {
      type: 'string',
      default: 'st',
      describe: 'Static prefix',
      coerce(v) {
        return v.replace(/[^a-z0-9]/g, '') || 'st';  // ensure prefix is basic ascii only
      },
      requiresArg: true,
    })
    .option('lang', {
      type: 'string',
      default: 'en',
      describe: 'Serving language',
    })
    .option('compile', {
      type: 'boolean',
      default: true,
      describe: 'Compile Closure scenes',
    })
    .argv;

/**
 * @param {polka.Polka} server
 * @param {number} port
 * @param {boolean} all
 */
function listen(server, port, all) {
  // Always listen on IPv4 in dev.
  return new Promise((resolve) => {
    if (all) {
      server.listen(port, '0.0.0.0', resolve);
    } else {
      server.listen(port, '127.0.0.1', resolve);
    }
  });
}

function clipboardCopy(v) {
  try {
    const clipboardy = require('clipboardy');
    clipboardy.writeSync(v);
  } catch (e) {
    return e;
  }
  return null;
}

const messages = i18n(yargs.lang);
log(chalk.red(messages('santatracker')), `[${yargs.lang}]`);


// nb. matches config in release.js
const baseurl = `http://127.0.0.1:${yargs.port + 80}/`;
const config = {
  staticScope: `${baseurl}${yargs.prefix}/`,
  version: `dev-${(new Date).toISOString().replace(/[^\d]/g, '')}`,
  baseurl,
};

async function serve() {
  const vfs = santaVfs(config.staticScope, {
    compile: yargs.compile,
    lang: yargs.lang,
    config,
  });

  const staticHost = dhost({
    path: 'static',
    cors: true,
    serveLink: true,
  });
  const staticServer = polka();
  staticServer.use(yargs.prefix, vfsMiddleware(vfs, 'static'), staticHost);

  await listen(staticServer, yargs.port + 80, yargs.all);
  log('Static', chalk.green(config.staticScope), yargs.all ? chalk.red('(on all interfaces)') : '');

  const prodServer = polka();

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

    // Serve the raw HTML.
    const filename = path.join('prod', servePath);
    const content = await fs.readFile(filename, 'utf-8');

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(content);
  };

  prodServer.use(
    prodHtmlMiddleware,
    vfsMiddleware(vfs, 'prod'),
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
