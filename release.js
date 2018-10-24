#!/usr/bin/env node

/**
 * @fileoverview Builds Santa Tracker for release to production.
 */

const log = require('fancy-log');
const colors = require('ansi-colors');
const glob = require('glob');
const dom = require('./build/dom.js');
const fsp = require('./build/fsp.js');
const isUrl = require('./build/is-url.js');
const path = require('path');
const compileCss = require('./build/compile-css.js');

// Generates a version like `vYYYYMMDDHHMM`, in UTC time.
const DEFAULT_STATIC_VERSION = 'v' + (new Date).toISOString().replace(/[^\d]/g, '').substr(0, 12);

const yargs = require('yargs')
    .strict()
    .epilogue('https://github.com/google/santa-tracker-web')
    .option('build', {
      alias: 'b',
      type: 'string',
      default: DEFAULT_STATIC_VERSION,
      describe: 'production build tag',
    })
    .option('baseurl', {
      type: 'string',
      default: '',
      describe: 'production base href',
    })
    .option('api_base', {
      type: 'string',
      default: 'https://santa-api.appspot.com/',
      describe: 'base URL for Santa\'s API',
    })
    .option('autoprefixer', {
      type: 'string',
      default: '> 3%, chrome >= 44, ios_saf >= 9, ie >= 11',
      describe: 'browsers to run autoprefixer for',
    })
    .argv;

async function release() {
  log(`Building Santa Tracker ${colors.red(yargs.build)}...`);
  await fsp.mkdirp('dist/static');
  await fsp.mkdirp('dist/prod');

  // Read the ES6 scenes module by eval-ing it in place. Don't try this at home.
  const scenes = eval((await fsp.readFile('./scenes.js', 'utf8')).replace('export default', ''));
  log(`Found ${colors.blue(`${Object.keys(scenes).length} scenes`)}`);

  // Santa Tracker builds by finding HTML entry points and parsing/rewriting each file, including
  // traversing their dependencies like CSS and JS. It doesn't specifically compile CSS or JS on
  // its own, it must be included by one of our HTML entry points.
  const htmlFiles = ['index.html'].concat(glob.sync('scenes/**/*.html'));
  for (const file of htmlFiles) {
    const src = await fsp.readFile(file, 'utf8');
    const node = dom.parse(src);

    // Inline all local styles.
    const styleLinks = Array.from(node.querySelectorAll('link[rel="stylesheet"]'));
    for (const styleLink of styleLinks) {
      if (isUrl(styleLink.href)) {
        continue;
      }
      // TODO(samthor): Make reusable for compiling CSS-in-JS.
      // TODO(samthor): Pass through autoprefixer browser request. Create 'style compiler' helper?
      const css = await compileCss(path.join(path.dirname(file), styleLink.href), {compile: true});
      const inlineStyleTag = node.createElement('style');
      inlineStyleTag.innerHTML = css;
      styleLink.parentNode.replaceChild(inlineStyleTag, styleLink);
    }

    // Find all module scripts. Normal scripts are ignored; these are used for things like jQuery,
    // THREE.js, and other libraries that are effectively globals.
    // TODO(samthor): As elements defined in JS contain language strings, these should be built
    // per-language. Language switching is "rare", so don't bother trying to dedup, just build
    // separately per-language.
    const scripts = Array.from(node.querySelectorAll('script')).filter((s) => s.type === 'module');
    for (const script of scripts) {
      console.info('got module script', script.src);

      // TODO(samthor): Do something with these entrypoints.
      // => For `nomodule`, just rollup and transpile from here.
      // => For modules, build and ship the minimum tree of splits.
      let entrypoint;
      if (script.src) {
        entrypoint = path.join(file, script.src);
      } else {
        entrypoint = file;
      }
    }

    // TODO(samthor): Some scenes need to be expanded to local language versions. 
  }
}

release().catch((err) => {
  console.warn(err);
  process.exit(1);
});
