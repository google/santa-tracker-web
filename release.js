#!/usr/bin/env node

/**
 * @fileoverview Builds Santa Tracker for release to production.
 */

const color = require('ansi-colors');
const compileCss = require('./build/compile-css.js');
const compileScene = require('./build/compile-scene.js');
const dom = require('./build/dom.js');
const fsp = require('./build/fsp.js');
const globAll = require('./build/glob-all.js');
const isUrl = require('./build/is-url.js');
const log = require('fancy-log');
const matchScene = require('./build/match-scene.js');
const matchSceneMin = require('./build/match-scene-min.js');
const normalizeJs = require('./build/normalize-js.js');
const path = require('path');
const rollupEntrypoint = require('./build/rollup-entrypoint.js');

// Generates a version like `vYYYYMMDDHHMM`, in UTC time.
const DEFAULT_STATIC_VERSION = 'v' + (new Date).toISOString().replace(/[^\d]/g, '').substr(0, 12);
const DEFAULT_LANG = 'en';

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
      default: '/static',
      describe: 'absolute path or URL to static content',
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

const staticAssets = [
  'audio/*',
  'img/**/*',
  '!img/**/*_og.png',  // don't include OG images, too large
  'third_party/**',
  'scenes/**/models/**',
  'scenes/**/img/**',
  // 'components/url/*.js',
  // TODO(samthor): Better support for custom scenes (#1679).
  // 'scenes/snowflake/snowflake-maker/{media,third-party}/**',
  // 'scenes/snowball/models/*',
];

const prodAssets = [
  'img/**/*_og.png',
  'robots.txt',
  'img/*',  // TODO(samthor): split static/prod assets again
];

function prodToStatic(req) {
  if (isUrl(yargs.baseurl)) {
    // treat http://foo/bar as http://foo/bar/
    const trailer = yargs.baseurl.endsWith('/') ? '' : '/';
    return new URL(req, yargs.baseurl + trailer);
  }
  return path.join(yargs.baseurl, req);
}

async function write(target, content) {
  await fsp.mkdirp(path.dirname(target));
  await fsp.writeFile(target, content);
}

async function releaseAssets(target, req, extra=[]) {
  const assetsToCopy = globAll(...[].concat(req, extra));
  log(`Copying ${color.blue(assetsToCopy.length)} ${target} assets`);
  for (const asset of assetsToCopy) {
    const targetAssetPath = path.join('dist', target, asset);
    await fsp.mkdirp(path.dirname(targetAssetPath));
    await fsp.copyFile(asset, targetAssetPath);
  }
}

function translatedPathForFile(filename, lang) {
  const dir = path.dirname(filename);
  if (dir === '.') {
    if (lang === DEFAULT_LANG) {
      return filename;  // en goes in top-level dir
    }
    return `intl/${lang}_ALL/${filename}`;
  }

  const {sceneName, rest} = matchScene(filename);
  if (rest === 'index.html') {
    return path.join(dir, `${lang}.html`);
  }

  throw new Error(`Can't find translated path for ${filename}`);
}

/**
 * @param {string} id of the scene
 * @param {?Object} info from scenes.js
 * @return {string} msgid to use for naming the scene
 */
function nameForScene(id, info) {
  if (!id || !info) {
    return 'santatracker';
  } else if ('msgid' in info) {
    return info.msgid;
  } else if (info.video) {
    return `scene_videoscene_${id}`;
  } else {
    return `scene_${id}`;
  }
}

/**
 * Returns virtual module content for Rollup. This performs one of two tasks:
 *   1) extracts base64-encoded code from a "virtual" import (one generated from inside HTML)
 *   2) returns a Promise for Closure scene compilation
 */
function virtualModuleContent(id, importer) {
  if (importer === undefined) {
    const virtualSplitIndex = id.indexOf('::\0');
    if (virtualSplitIndex !== -1) {
      const buf = Buffer.from(id.slice(virtualSplitIndex + 3), 'base64');
      return buf.toString();
    }
  }

  if (!id.startsWith('./') && !id.startsWith('../')) {
    return undefined;  // not a real file
  }

  // Find where the target source file lives relative to the root.
  const dir = path.dirname(importer);
  const resolved = path.relative(__dirname, path.resolve(dir, id));

  // If it matches a scene, return a Promise for its compilation.
  const sceneName = matchSceneMin(resolved);
  if (sceneName !== null) {
    return (async () => {
      const {js, sourceMap} = await compileScene({sceneName}, true);
      return {code: js, map: sourceMap};
    })();
  }
}

async function release() {
  log(`Building Santa Tracker ${color.red(yargs.build)}...`);
  await fsp.mkdirp('dist/static');
  await fsp.mkdirp('dist/prod');

  // Find the list of languages by reading `_messages_`.
  const langs = (await fsp.readdir('_messages')).map((file) => file.split('.')[0]);
  if (!langs.includes(DEFAULT_LANG)) {
    throw new Error(`default lang '${DEFAULT_LANG}' not found in _messages`);
  }
  log(`Found ${color.blue(langs.length)} languages`);

  // Read the ES6 scenes module by eval-ing it in place. Don't try this at home.
  const scenes = eval((await fsp.readFile('./scenes.js', 'utf8')).replace('export default', ''));
  log(`Found ${color.blue(Object.keys(scenes).length)} scenes`);

  // Collects all script entrypoints in Santa Tracker.
  let virtualScriptIndex = 0;
  const entrypoints = new Set();
  const requiredScriptSources = new Set();
  const scriptRequiresStrings = new WeakMap();

  // Santa Tracker builds by finding HTML entry points and parsing/rewriting each file, including
  // traversing their dependencies like CSS and JS. It doesn't specifically compile CSS or JS on
  // its own, it must be included by one of our HTML entry points.
  const htmlFiles = ['index.html'].concat(globAll('scenes/*/index.html'));
  const htmlDocuments = new Map();
  for (const htmlFile of htmlFiles) {
    const dir = path.dirname(htmlFile);
    const src = await fsp.readFile(htmlFile, 'utf8');
    const document = dom.parse(src);
    htmlDocuments.set(htmlFile, document);

    // Add release/build notes to HTML.
    document.body.setAttribute('data-version', yargs.build);
    const devNode = document.getElementById('DEV');
    devNode && devNode.remove();

    // Inline all referenced styles which are available locally.
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    for (const styleLink of styleLinks) {
      if (isUrl(styleLink.href)) {
        continue;
      }
      // TODO(samthor): Make reusable for compiling CSS-in-JS.
      const cssFile = path.join(dir, styleLink.href);
      const css = await compileCss(cssFile, {compile: true});
      const inlineStyleTag = document.createElement('style');
      inlineStyleTag.innerHTML = css;
      styleLink.parentNode.replaceChild(inlineStyleTag, styleLink);
    }

    const allScripts = Array.from(document.querySelectorAll('script'));

    // Find non-module scripts, as they contain dependencies like jQuery, THREE.js etc. These are
    // catalogued and then included in the production output.
    const plainScriptNodes = allScripts.filter((s) => !s.type && s.src);
    for (const scriptNode of plainScriptNodes) {
      const resolved = path.relative(__dirname, path.join(dir, scriptNode.src));
      requiredScriptSources.add(resolved);

      // If this is from prod, redirect it to static paths.
      if (dir === '.') {
        scriptNode.src = prodToStatic(scriptNode.src);
      }
    }
    
    // Find all module scripts, so that all JS entrypoints can be catalogued and built together.
    const moduleScriptNodes = allScripts.filter((s) => s.type === 'module');
    for (const scriptNode of moduleScriptNodes) {
      let entrypoint;
      if (scriptNode.src) {
        entrypoint = path.join(dir, scriptNode.src);
      } else {
        // This is a script node with inline script. Create a virtual script that is used as the
        // Rollup entry point, with its content base64-encoded as a suffix.
        entrypoint = `${dir}/:${++virtualScriptIndex}::\0` +
            Buffer.from(scriptNode.textContent).toString('base64');
      }
      entrypoints.add({
        htmlFile,
        document,
        filename: entrypoint,
        scriptNode,
      });
    }
  }

  // Modify the index.html a bit more.
  const indexDocument = htmlDocuments.get('index.html');
  indexDocument.body.setAttribute('data-baseurl', yargs.baseurl);

  // Compile all found entrypoints.
  log(`Compiling ${color.blue(entrypoints.size)} ES entrypoints`);
  for (const {filename, scriptNode, document} of entrypoints) {
    // Run Rollup on the entrypoint. After compilation, it still contains magic template literals
    // `_msg` and `_style`. These are build-time translations and styles. If the output has any use
    // of `_msg`, the JS and HTML files must be fanned out per-language.
    const js = await rollupEntrypoint(filename, virtualModuleContent);

    // Interpolate styles and record needed strings for i18n fanout later.
    const stringsNeeded = new Set();
    const handler = (name, arg) => {
      switch (name) {
        case '_msg':
          stringsNeeded.add(arg);
          break;
        case '_style':
          return compileCss(`styles/${arg}.scss`, true);
      }
    };
    const compiled = normalizeJs(null, js, handler);  // null filename: don't do imports
    scriptRequiresStrings.set(scriptNode, stringsNeeded);

    // Update the entrypoint with the compiled code. Include a preamble for Safari 10's broken
    // nomodule support, which prevents double execution: if noModule doesn't exist but this module
    // code *is* being executed, then fail early and fall-through to the ES5 version.
    // TODO(samthor): This should really use graph thinger to generate only the minimum needed
    // dependencies for ES6 builds.
    scriptNode.removeAttribute('src');
    scriptNode.textContent = `if(!('noModule' in document.createElement('script')))eval('return;');\n` + compiled;
    scriptNode.toggleAttribute('defer', true);

    // Insert the nomodule/ES5 of the code immediately after the module code.
    // TODO(samthor): This should compile to ES5 for a `<script nomodule>`.
    const nomoduleScriptNode = document.createElement('script');
    nomoduleScriptNode.textContent = compiled;
    nomoduleScriptNode.toggleAttribute('nomodule', true);
    nomoduleScriptNode.toggleAttribute('defer', true);
    scriptNode.parentNode.insertBefore(nomoduleScriptNode, scriptNode);

    // TODO(samthor): This should minify and write the files somewhere, rather than inlining.
  }

  // Write out all documents.
  log(`Writing ${color.blue(htmlDocuments.size)} HTML entrypoints for ${color.blue(langs.length)} langs`);
  for (const [htmlFile, document] of htmlDocuments) {
    const {sceneName} = matchScene(htmlFile);
    const allScripts = Array.from(document.querySelectorAll('script'));
    const moduleScriptNodes = allScripts.filter((s) => s.type === 'module');

    // Merge all needed strings for this particular document.
    const allStringsNeeded = new Set();
    for (const scriptNode of moduleScriptNodes) {
      for (const neededString of scriptRequiresStrings.get(scriptNode) || []) {
        allStringsNeeded.add(neededString);
      }
    }
    log(`Need ${color.green(allStringsNeeded.size)} strings for ${color.cyan(htmlFile)}`);

    // Create an optional node to contain translations.
    const msgNode = document.createElement('script');
    if (allStringsNeeded.size) {
      msgNode.toggleAttribute('defer', true);
      document.head.insertBefore(msgNode, document.head.firstChild);
    }

    for (const lang of langs) {
      const messages = require(`./_messages/${lang}.json`);

      // Update the message preamble for every language.
      const limitedStrings = {};
      allStringsNeeded.forEach((msgid) => {
        if (!(msgid in messages)) {
          // TODO(samthor): Do centrally so we can provide language stats at end
          log(`Missing string ${msgid} for ${lang}`);
          limitedStrings[msgid] = '?';
        } else {
          limitedStrings[msgid] = messages[msgid].message;
        }
      });
      msgNode.textContent = `var __msg=${JSON.stringify(limitedStrings)};function _msg(id){return __msg[id]}`;

      const msgid = nameForScene(sceneName, scenes[sceneName]);
      document.documentElement.lang = lang;
      document.title = messages[msgid].message;

      const dir = path.dirname(htmlFile);
      const outputDir = (dir === '.' ? 'dist/prod' : 'dist/static');  // translatedPath includes tail path
      const translatedPath = translatedPathForFile(htmlFile, lang);
      await write(path.join(outputDir, translatedPath), dom.serialize(document));
    }

    // const dir = path.dirname(htmlFile);
    // const outputDir = (dir === '.' ? 'dist/prod' : path.join('dist/static', dir));
    // await write(path.join(outputDir, path.basename(htmlFile), dom.serialize(document));
  }

  // Copy static/prod files.
  await releaseAssets('prod', prodAssets);
  await releaseAssets('static', staticAssets, [...requiredScriptSources]);

  log(`Done!`);
}

release().catch((err) => {
  console.warn(err);
  process.exit(1);
});
