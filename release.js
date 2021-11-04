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


/**
 * @fileoverview Builds Santa Tracker for release to production.
 */

const babel = require('@babel/core');
const generator = require('@babel/generator');
const traverse = require('@babel/traverse');
const chalk = require('chalk');
const fsp = require('./build/fsp.js');
const globAll = require('./build/glob-all.js');
const i18n = require('./build/i18n.js');
const importUtils = require('./build/import-utils.js');
const log = require('fancy-log');
const path = require('path');
const releaseHtml = require('./build/release-html.js');
const santaVfs = require('./santa-vfs.js');
const modernBuilder = require('./build/modern-builder.js');
const sourceMagic = require('./build/source-magic.js');
const {Writer} = require('./build/writer.js');
const JSON5 = require('json5');
const {Worker} = require('worker_threads');
const WorkGroup = require('./build/group.js');
const { getCurrentVersion } = require('./build/git-version.js');

const DISABLED_SCENES = 'poseboogie languagematch'.split(/\s+/);

// Generates a version like `vYYYYMMDDHHMM`, in UTC time.
const DEFAULT_STATIC_VERSION = 'v' + (new Date).toISOString().replace(/[^\d]/g, '').substr(0, 12);
const DEFAULT_LANG = 'en';  // write these files to top-level

const yargs = require('yargs')
    .strict()
    .epilogue('https://github.com/google/santa-tracker-web')
    .option('build', {
      alias: 'b',
      type: 'string',
      default: DEFAULT_STATIC_VERSION,
      describe: 'Production build tag',
    })
    .options('transpile', {
      type: 'boolean',
      default: true,
      describe: 'Transpile for ES5 browsers (slow)',
    })
    .options('minify', {
      type: 'boolean',
      default: true,
      describe: 'Minify JavaScript output',
    })
    .option('default-only', {
      alias: 'o',
      type: 'boolean',
      default: false,
      describe: 'Only generate top-level language',
    })
    .option('baseurl', {
      type: 'string',
      default: 'https://maps.gstatic.com/mapfiles/santatracker/',
      describe: 'URL to static content',
      coerce: (raw) => {
        // Ensures that the passed baseurl ends with '/', or if not passed an actual URL, that it
        // starts with '/'.
        if (!raw.endsWith('/')) {
          raw = `${raw}/`;
        }
        try {
          new URL(raw);
          return raw;
        } catch (e) {
          // ignore
        }
        return importUtils.pathname(raw);  // ensures this has a leading '/'
      },
    })
    .option('prod', {
      type: 'boolean',
      default: true,
      describe: 'Whether to build prod and related static entrypoint',
    })
    .option('scene', {
      type: 'array',
      default: [],
      describe: 'Limit static build to selected scenes',
    })
    .argv;

// These assets are copied verbatim into the dist static/prod folders. Note the ! exclusions below.
const assetsToCopy = [
  'static/audio/*',
  'static/fallback-audio/*',
  'static/img/**/*',
  'static/third_party/**/LICENSE*',
  'static/third_party/lib/klang/**',
  'static/scenes/**/models/**',
  'static/scenes/**/img/**',

  // Explicitly include Web Components loader and polyfill bundles, as they're injected at runtime
  // rather than being directly referenced by a `<script>`.
  'static/node_modules/@webcomponents/webcomponentsjs/bundles/*.js',
  'static/node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
  'static/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',

  'prod/**',
  '!prod/**/*.html',
  '!prod/**/*.js',
  '!prod/**/*.json',
];

// nb. matches config in serve.js
const config = {
  staticScope: importUtils.joinDir(yargs.baseurl, yargs.build),
  version: yargs.build,
  baseurl: yargs.baseurl,
};

const vfs = santaVfs(config.staticScope, {config});

const releaseWriter = new Writer({
  loader: vfs,
  allowed: ['static', 'prod'],
  target: 'dist',
});

const workGroup = WorkGroup();

/**
 * Terser is slow and CPU-bound, so push it out to multiple cores.
 *
 * @param {string} code to minify
 * @return {Promise<string>}
 */
async function optionalMinify(code) {
  if (!yargs.minify) {
    return code;
  }
  await workGroup(async () => {
    const w = new Worker(__dirname + '/build/terser-worker.js', {
      workerData: code,
    });
    const result = await new Promise((resolve, reject) => {
      w.on('message', resolve);
      w.on('error', reject);
      w.on('exit', reject);
    });
    w.unref();
    w.terminate();
    if (result.error) {
      throw new TypeError(`Terser error on ${fileName}: ${result.error}`);
    }
    code = result.code;
  });
  return code;
}

function prodPathForLang(lang) {
  if (lang === DEFAULT_LANG) {
    return 'prod';
  }
  return `prod/intl/${lang}_ALL`
}

function rewritePathForLang(id, lang) {
  if (!lang) {
    return id;
  }
  const p = path.parse(id);
  return path.join(p.dir, `${p.name}_${lang}${p.ext}`);
}

/**
 * @return {!Array<string>} all entrypoint HTML files to be built for this release
 */
async function findStaticHtml() {
  let htmlFiles;

  if (yargs.scene.length) {
    const globArg = yargs.scene.map((scene) => path.join('static/scenes', scene, '**/index.html'));
    htmlFiles = globAll(...globArg);
  } else {
    htmlFiles = globAll('static/**/index.html');
  }

  htmlFiles = htmlFiles.filter((raw) => {
    const sceneMatch = raw.match(/^static\/scenes\/(.*?)\//);
    return !(sceneMatch && DISABLED_SCENES.includes(sceneMatch[1]));
  });

  return htmlFiles;
}

async function release() {
  log(`Building Santa Tracker ${chalk.red(yargs.build)}...`);
  log(`Platform: ${chalk.red(process.platform)}`);

  const gitRevision = await getCurrentVersion();
  log(`git revision: ${chalk.red(gitRevision)}`);

  if (await fsp.exists('dist')) {
    log(`Removing previous release...`);
    await fsp.unlinkAll('dist');
  }

  // Create both "static" and "prod" targets inside dist. This lets us build the site (which, at
  // the top-level, is in "static" and "prod" dirs) and just deploy to those matching dirs.
  const staticRoot = importUtils.pathname(config.staticScope);
  if (importUtils.isUrl(config.staticScope)) {
    // In normal operation (baseurl is on a unique domain), "_static" contains the actual static
    // root with its entire path. Create a symlink for "static" which points there.
    await fsp.mkdirp(path.join('dist/_static', staticRoot));
    await fsp.symlink(path.join('_static', staticRoot), 'dist/static');
  } else {
    // If hosting on one domain, the "static" symlink points within "prod", as there's just one
    // directory of content to serve.
    await fsp.mkdirp(path.join('dist/prod', staticRoot));
    await fsp.symlink(path.join('prod', staticRoot), 'dist/static');
  }
  await fsp.mkdirp('dist/prod');
 
  // Display the static URL plus the root (in a different color).
  if (!config.staticScope.endsWith(staticRoot)) {
    throw new TypeError(`invalid static resolution: ${config.staticScope} vs ${staticRoot}`)
  }
  const domainNotice = importUtils.isUrl(config.staticScope) ? '' : '(local)';
  log('Static at', chalk.green(config.staticScope), domainNotice);

  // Find the list of languages by reading `_messages`.
  const missingMessages = {};
  const langs = i18n.all((lang, msgid) => {
    if (!(msgid in missingMessages)) {
      missingMessages[msgid] = new Set();
    }
    missingMessages[msgid].add(lang);
  });
  if (!(DEFAULT_LANG in langs)) {
    throw new Error(`default lang '${DEFAULT_LANG}' not found in _messages`);
  }
  if (yargs.defaultOnly) {
    Object.keys(langs).forEach((otherLang) => {
      if (otherLang !== DEFAULT_LANG) {
        delete langs[otherLang];
      }
    });
  }
  log(`Building ${chalk.cyan(Object.keys(langs).length)} languages`);

  // Release prod entrypoints.
  if (yargs.prod) {
    await releaseProd(langs);
  }

  // Shared resources needed by prod build.
  const staticEntrypoints = {};
  const fallbackEntrypoints = {};
  const requiredExternalSources = new Set();

  // Santa Tracker builds static by finding HTML entry points and parsing/rewriting each file,
  // including traversing their dependencies like CSS and JS. It doesn't specifically compile CSS 
  // or JS on its own, it must be included by one of our HTML entry points.
  const htmlFiles = await findStaticHtml();
  if (!htmlFiles.length) {
    throw new Error('No static entrypoints matched (bad --scene?)');
  }

  log(`Processing ${chalk.cyan(htmlFiles.length)} entrypoint HTML files...`);

  const htmlDocuments = new Map();
  for (const htmlFile of htmlFiles) {
    const dom = await releaseHtml.dom(htmlFile);
    const document = dom.window.document;

    const dir = path.dirname(htmlFile);

    // Find assets that are going to be inlined.
    const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')];
    const allScripts = Array.from(document.querySelectorAll('script')).filter((scriptNode) => {
      return !(scriptNode.src && importUtils.isUrl(scriptNode.src));
    });

    // Inline all local referenced styles.
    for (const styleLink of styleLinks) {
      if (importUtils.isUrl(styleLink.href)) {
        continue;  // TODO(samthor): mostly Google Fonts, but could be worth validating
      }
      const target = path.join(dir, styleLink.href);
      const out = await vfs(target) || await fsp.readFile(target, 'utf-8');
      const inlineStyleTag = document.createElement('style');
      inlineStyleTag.innerHTML = typeof out === 'string' ? out : ('code' in out ? out.code : out);
      styleLink.replaceWith(inlineStyleTag);
    }

    // Find non-module scripts, as they contain dependencies like jQuery, THREE.js etc. These are
    // catalogued and then included in the static output.
    const external = allScripts
        .filter((s) => s.src && (!s.type || s.type === 'text/javascript')).map((s) => s.src);
    external.push(...[...document.querySelectorAll('link[rel="preload"]')].map((s) => s.href));
    external.forEach((src) => {
      // ... only add if they're local
      if (!importUtils.isUrl(src)) {
        requiredExternalSources.add(path.join(dir, src));
      }
    });

    // Create knowledge of all imports for this HTML file. Remove all module scripts.
    let imports = 0;
    const moduleScriptNodes = allScripts.filter((s) => s.type === 'module');
    for (const scriptNode of moduleScriptNodes) {
      let code = scriptNode.textContent;
      if (scriptNode.src) {
        if (code) {
          throw new TypeError(`got invalid <script>: both code and src`);
        }
        code = importUtils.staticImport(scriptNode.src);
      }
      scriptNode.remove();

      // Either way, this creates a virtual import: if the <script> contained code, it's just that;
      // otherwise, it imports the external file.
      staticEntrypoints[`${dir}/${imports}.js`] = code;
      if (yargs.transpile) {
        fallbackEntrypoints[`${dir}/fallback-${imports}.js`] = code;
      }
      ++imports;
    }

    htmlDocuments.set(htmlFile, {dom, imports, dir});
  }

  // Optionally include entrypoints (needed for prod).
  if (yargs.prod) {
    staticEntrypoints['static/entrypoint.js'] = undefined;
    staticEntrypoints['prod/sw.js'] = undefined;

    if (yargs.transpile) {
      fallbackEntrypoints['static/fallback.js'] = undefined;
    }

    // This isn't guarded by a transpile check, because we want always want to transpile it anyway.
    fallbackEntrypoints['prod/loader.js'] = undefined;
  }

  log(`Found ${chalk.cyan(requiredExternalSources.size)} required external sources`);
  log(`Found ${chalk.cyan(Object.keys(staticEntrypoints).length)} modern entrypoints (${chalk.cyan(Object.keys(fallbackEntrypoints).length)} support/loader), merging...`);

  const builderOptions = {
    loader: vfs,
    external(id) {
      if (id === 'static/src/magic.js') {
        return '__magic';
      }
    },
    workDir: 'static',  // TODO: invalid for prod, but we don't use import.meta there
    metaUrlScope: config.staticScope,
  };

  const bundles = await modernBuilder(staticEntrypoints, builderOptions);
  const fallbackBundles = await Promise.all(Object.keys(fallbackEntrypoints).map((fallbackKey) => {
    const localConfig = {[fallbackKey]: fallbackEntrypoints[fallbackKey]};
    const options = Object.assign({commonJS: true}, builderOptions);
    return modernBuilder(localConfig, options);
  }));
  fallbackBundles.forEach((all) => bundles.push(...all));

  log(`Generated ${chalk.cyan(bundles.length)} bundles via Rollup, rewriting...`);
  const transpileDeps = new Set([
    'whatwg-fetch',
    './src/polyfill/classlist--toggle.js',
    './src/polyfill/element--closest.js',
    './src/polyfill/node.js',
    './src/polyfill/event.js',
  ]);

  // Prepare rewriters for all scripts, and determine whether they need i18n at all.
  const annotatedBundles = {};
  const bundleTasks = bundles.map(async (bundle) => {
    if (bundle.isDynamicEntry) {
      // Santa Tracker doesn't handle these.
      throw new TypeError(`dynamic entry unsupported: ${bundle.fileName}`);
    } else if (bundle.facadeModuleId && path.dirname(bundle.fileName) !== path.dirname(bundle.facadeModuleId)) {
      // Sanity-check expectations.
      throw new TypeError(`unexpected divergence of fileName ${bundle.fileName} vs facadeModuleId ${bundle.facadeModuleId}`);
    } else if (bundle.fileName in annotatedBundles) {
      // We already have this for some reason (duplicate bundle).
      throw new TypeError(`Already got output file: ${bundle.fileName}`);
    }

    const magic = sourceMagic();
    const presets = [];
    const plugins = [magic.plugin];

    const transpile = (bundle.facadeModuleId in fallbackEntrypoints);
    if (transpile) {
      log(`Early transpiling ${chalk.yellow(bundle.fileName)}...`);
      presets.push(
        ['@babel/preset-env', {
          useBuiltIns: 'usage',
          corejs: 3,
          targets: {
            browsers: ['ie >= 11'],
          },
          exclude: [
            // Exclude these, otherwise the "__magic" import gets rewritten to require()
            '@babel/plugin-transform-modules-commonjs',
            '@babel/plugin-proposal-dynamic-import',
          ],
          loose: true,
        }],
      );
      plugins.push('@babel/plugin-transform-destructuring');
    } else {
      log(`Preparing ${chalk.yellow(bundle.fileName)}...`);
    }

    const transformOptions = {code: false, ast: true, presets, plugins};
    const transformResult = await babel.transform(bundle.code, transformOptions);

    if (transpile) {
      // core-js gets included but not bundled: use this to find all deps
      traverse.default(transformResult.ast, {
        ImportDeclaration(nodePath) {
          const path = nodePath.node.source.value;
          if (importUtils.alreadyResolved(path)) {
            throw new TypeError(`should only find unresolved additions by core-js, was: ${path}`);
          }
          transpileDeps.add(path);
          nodePath.remove();
        },
      });
    }

    annotatedBundles[bundle.fileName] = {
      ast: transformResult.ast,
      transpile,
      entrypoint: (bundle.facadeModuleId in staticEntrypoints || bundle.facadeModuleId in fallbackEntrypoints),
      i18n: magic.seen('_msg'),
      visit: magic.visit,
      imports: bundle.imports.filter((x) => x !== '__magic'),
    };
  });
  await Promise.all(bundleTasks);

  // Special-case building support.js for static, based on all the core-js deps. We need to build
  // it as an 'iife' here as we don't wrap it below.
  const supportCode = Array.from(transpileDeps).map((dep) => `import '${dep}';\n`).join('');
  const supportOutput = await modernBuilder(
      {'static/support.js': supportCode}, {commonJS: true, workDir: 'static', format: 'iife'});
  releaseWriter.file('static/support.js', await optionalMinify(supportOutput[0].code));
  log(`Released support JS with ${chalk.yellow(transpileDeps.size)} deps...`);

  // Determine the transitive properties of each bundle: their import tree (for preload) and if
  // they must be re-compiled for i18n even _without_ messages.
  let rewrittenSources = 0;
  const buildAstVisitor = (lang) => {
    return {
      taggedTemplate(name, key) {
        switch (name) {
          case '_static':
            return config.staticScope + key;

          case '_msg':
            if (lang !== null) {
              const messages = langs[lang];
              return messages(key);
            }

          default:
            throw new TypeError(`unsupported magic: ${name}`);
        }
      },
      rewriteImport(id) {
        const bundle = annotatedBundles[id];
        if (bundle && bundle.i18n) {
          if (!lang) {
            throw new TypeError(`Got bundle without lang request`);
          }
          return rewritePathForLang(id, lang);
        }
      },
    };
  };

  // Loop over and mark i18n deps.
  for (const fileName in annotatedBundles) {
    const b = annotatedBundles[fileName];
    if (b.i18n) {
      continue;
    }

    // Mark all dependencies as _also_ needing i18n versions.
    // If we're _not_ i18n, then check if one of our imports is (and then we have to be, too).
    const work = new Set(b.imports);
    for (const dep of work) {
      const o = annotatedBundles[dep];
      if (o.i18n) {
        b.i18n = true;
        continue;
      }
      o.imports.forEach((i) => work.add(i));
    }
  }

  // Run again, to avoid race condition: we mark i18n above.
  const workerTasks = [];
  for (const fileName in annotatedBundles) {
    const b = annotatedBundles[fileName];

    // Sanity-check that we don't have a transpiled chunk?!
    if (!b.entrypoint && b.transpile) {
      throw new TypeError(`got bad bundle with (!entrypoint && transpile): ${fileName}`);
    }

    const langKeys = b.i18n ? Object.keys(langs) : [null];
    workerTasks.push(...langKeys.map(async (lang) => {
      const langFileName = rewritePathForLang(fileName, lang);

      b.visit(fileName, buildAstVisitor(lang));

      let {code} = generator.default(b.ast, {comments: false});
      if (b.transpile) {
        code = `;(function(){${code}\n/**/})();`;  // gross
      }
      code = await optionalMinify(code);
      releaseWriter.file(langFileName, code);
      ++rewrittenSources;
    }));

    const attrs = [];
    b.entrypoint && attrs.push('entrypoint');
    b.i18n && attrs.push('i18n');
    b.transpile && attrs.push('transpile');

    const prettyAttrs = attrs.map((attr) => chalk.magenta(attr)).join(',');
    log(`Rewritten bundle ${chalk.yellow(fileName)} [${prettyAttrs}]...`);
  }

  log(`Waiting on ${chalk.cyan(workerTasks.length)} worker tasks...`);
  await Promise.all(workerTasks);
  log(`Rewrote ${chalk.cyan(rewrittenSources)} source files`);

  // Now, rewrite all static HTML files for every language.
  for (const [fileName, {dom, imports, dir}] of htmlDocuments) {
    const importIsTranslated = [];
    for (let i = 0; i < imports; ++i) {
      // nb. This doesn't check support code, but it should be the same.
      const i18n = annotatedBundles[`${dir}/${i}.js`].i18n;
      importIsTranslated.push(i18n);
    }

    // Insert a fixed preamble that loads the correct JS.
    if (imports) {
      const pathToSupport = path.relative(path.dirname(fileName), 'static/support.js');
      const document = dom.window.document;
      const preamble = `
(function() {
  var fallback = (location.search || '').match(/\\bfallback=1\\b/);
  var all = ${JSON.stringify(importIsTranslated)}.map(function(i18n, i) {
    return (fallback ? 'fallback-' : '') + i + (i18n ? '_' + document.documentElement.lang : '') + '.js';
  });
  fallback && all.unshift(${JSON.stringify(pathToSupport)});
  (function next() {
    var src = all.shift();
    if (src) {
      var node = document.createElement('script');
      node.src = src;
      if (fallback) {
        node.onload = node.onerror = next;
      } else {
        node.setAttribute('type', 'module');
        next();
      }
      document.head.appendChild(node);
    }
  })();
})();`
      const scriptNode = document.createElement('script');
      scriptNode.textContent = preamble;
      document.body.append(scriptNode);
    }

    const applyLang = releaseHtml.buildApplyLang(dom);
    for (const lang in langs) {
      const serialized = applyLang(langs[lang]);
      releaseWriter.file(rewritePathForLang(fileName, lang), serialized);
    }
  }

  // Copy everything else (but filter prod assets if not requested).
  const otherAssets = globAll(...assetsToCopy).concat(...requiredExternalSources)
  const limitedOtherAssets = yargs.prod ? otherAssets : otherAssets.filter((f) => !f.startsWith('prod/'));
  const otherAssetsCount = releaseWriter.all(limitedOtherAssets);
  log(`Releasing ${chalk.cyan(otherAssetsCount)} static assets`);

  // Display information about missing messages.
  const missingMessagesKeys = Object.keys(missingMessages);
  if (missingMessagesKeys.length) {
    log(`Missing ${chalk.red(missingMessagesKeys.length)} messages:`);
    missingMessagesKeys.forEach((msgid) => {
      const missingLangs = missingMessages[msgid];
      const ratio = (missingLangs.size / Object.keys(langs).length * 100).toFixed() + '%';
      const rest = (missingLangs.size <= 10) ? `[${[...missingLangs]}]` : '';
      console.info(chalk.yellow(msgid), 'for', chalk.red(ratio), 'of langs', rest);
    });
  }

  // Write git hash and build version to a known location in prod.
  // We don't use this in an actual production build (since they're not automated), but this is
  // picked up by the staging code.
  const siteHashConents = `${gitRevision}:${yargs.build}`;
  log(`Written build hash: ${siteHashConents}`);
  releaseWriter.file('prod/hash', siteHashConents);

  // Wait for writing to complete and announce success! \o/
  const count = await releaseWriter.wait();
  log(`Done! Written ${chalk.cyan(count)} files`);
}

/**
 * @return {!Map<string, string>} entrypoints that should be generated for prod
 */
async function findProdPages() {
  // This is a bit gross but relies on this file to have an expected format.
  const raw = await fsp.readFile('./static/src/strings/scenes.js', 'utf-8');

  // nb. [^] matches anything _including_ newlines
  const dictMatch = raw.match(/^export default (\{[^]*\})/m);
  if (!dictMatch) {
    throw new TypeError(`expected ./static/src/strings/scenes.js to contain "export default { ... }`);
  }

  const validInput = dictMatch[1].replace(/_msg`(\w+)`/g, (_, arg) => `'${arg}'`);
  const pages = JSON5.parse(validInput);
  if (!('index' in pages)) {
    pages['index'] = pages[''] || '';
  }
  for (const key of Object.keys(pages)) {
    // Remove Android-only scenes.
    if (key.startsWith('@')) {
      delete pages[key];
    } else if (DISABLED_SCENES.includes(key)) {
      delete pages[key];
    }
  }
  delete pages[''];  // don't explicitly generate blank top-level page

  // Find any pages we might be missing.
  const diskScenes = (await fsp.readdir('./static/scenes')).filter((cand) => cand.match(/^[a-z  ]+/));
  for (const page of diskScenes) {
    if (!(page in pages)) {
      pages[page] = '';
    }
  }

  return pages;
}

async function releaseProd(langs) {
  const prodPages = await findProdPages();
  log(`Found ${chalk.cyan(Object.keys(prodPages).length)} prod pages`);

  // Match non-index.html prod pages, like cast, error etc.
  let prodHtmlCount = 0;
  const prodOtherHtml = globAll('prod/*.html', '!prod/index.html');
  for (const htmlFile of prodOtherHtml) {
    const documentForLang = await releaseHtml.load(htmlFile);

    const tail = path.basename(htmlFile);
    for (const lang in langs) {
      const target = path.join(prodPathForLang(lang), tail);
      releaseWriter.file(target,  documentForLang(langs[lang]));
      ++prodHtmlCount;
    }

    // Since this was a special entrypoint, remove it from normal generation of entrypoints, as it
    // would just get clobbered anyway.
    const page = path.basename(htmlFile, '.html');
    delete prodPages[page];
  }

  // Fanout prod index.html to all scenes and langs.
  for (const page in prodPages) {
    // TODO(samthor): This loads and minifies the prod HTML ~scenes times, but it is destructive.
    const documentForLang = await releaseHtml.load('prod/index.html', async (document) => {
      const head = document.head;

      // Load the entrypoint as a raw script, so it works everywhere, not just in module browsers.
      const loaderNode = head.querySelector('script[type="module"]');
      loaderNode.removeAttribute('type');

      const image = `prod/images/og/${page}.png`;
      if (await fsp.exists(image)) {
        const url = `https://santatracker.google.com/images/og/${page}.png`;
        const all = [
          '[property="og:image"]',
          '[name="twitter:image"]',
        ];
        releaseHtml.applyAttributeToAll(head, all, 'content', url);
      }

      // nb. In 2019+, titles are just e.g. "Santa's Canvas", not "Santa's Canvas - Google Santa
      // Tracker".
      const msgid = prodPages[page] || 'meta_title';
      const matched = releaseHtml.applyAttributeToAll(head, ['[data-title]'], 'msgid', msgid);
      matched.forEach((n) => n.removeAttribute('data-title'));
    });

    for (const lang in langs) {
      const target = path.join(prodPathForLang(lang), `${page}.html`);
      releaseWriter.file(target, documentForLang(langs[lang]));
      ++prodHtmlCount;
    }
  }

  log(`Generated ${chalk.cyan(prodHtmlCount)} prod pages`);

  // Generate manifest.json for every language.
  const manifest = require('./prod/manifest.json');
  for (const lang in langs) {
    const messages = langs[lang];
    manifest['name'] = messages('santatracker');
    manifest['short_name'] = messages('santa-app');
    const target = path.join(prodPathForLang(lang), 'manifest.json');
    releaseWriter.file(target, JSON.stringify(manifest));
  }

  log(`Generated ${chalk.cyan(Object.keys(langs).length)} manifest files`);
}

release().catch((err) => {
  console.warn(err);
  process.exit(1);
});
