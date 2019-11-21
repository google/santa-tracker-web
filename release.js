#!/usr/bin/env node

/**
 * @fileoverview Builds Santa Tracker for release to production.
 */

const babel = require('@babel/core');
const generator = require('@babel/generator');
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
const rollup = require('rollup');
const Terser = require('terser');

// Never generate code for these scenes.
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

const assetsToCopy = [
  'static/audio/*',
  'static/img/**/*',
  'static/third_party/**/LICENSE*',
  'static/third_party/lib/klang/**',
  'static/scenes/**/models/**',
  'static/scenes/**/img/**',

  // Explicitly include Web Components loader and polyfill bundles, as they're injected at runtime
  // rather than being directly referenced by a `<script>`.
  'static/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
  'static/node_modules/@webcomponents/webcomponentsjs/bundles/*.js',

  'prod/**',
  '!prod/**/*.html',
  '!prod/**/*.js',
  '!prod/**/*.json',
];

// nb. matches config in serve.js
const config = {
  staticScope: importUtils.joinDir(yargs.baseurl, yargs.build),
  version: yargs.build,
};

const vfs = santaVfs(config.staticScope, {config});

const releaseWriter = new Writer({
  loader: vfs,
  allowed: ['static', 'prod'],
  target: 'dist',
});

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

    if (yargs.transpile) {
      fallbackEntrypoints['static/fallback.js'] = undefined;
      fallbackEntrypoints['static/support.js'] = undefined;
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

  const annotatedBundles = {};
  const sourceMagicBuilder = sourceMagic({
    magicImport(importName) {
      return importName === '__magic';
    },
    taggedTemplate(lang, name, key) {
      switch (name) {
        case '_msg':
          const messages = langs[lang];
          return messages(key);

        case '_static':
          return config.staticScope + key;

        default:
          throw new TypeError(`unsupported magic: ${name}`);
      }
    },
    rewriteImport(lang, id) {
      const bundle = annotatedBundles[id];
      if (bundle && bundle.i18n) {
        if (!lang) {
          throw new TypeError(`Got bundle without lang request`);
        }
        return rewritePathForLang(id, lang);
      }
    },
  });

  // Prepare rewriters for all scripts, and determine whether they need i18n at all.
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

    const {seen, rewrite} = await sourceMagicBuilder(bundle.code, bundle.fileName);
    const entrypoint = bundle.facadeModuleId in staticEntrypoints || bundle.facadeModuleId in fallbackEntrypoints || false;

    annotatedBundles[bundle.fileName] = {
      transpile: bundle.facadeModuleId in fallbackEntrypoints,
      entrypoint,
      i18n: seen.has('_msg'),
      rewrite,
      imports: bundle.imports.filter((x) => x !== '__magic'),
    };
  });
  await Promise.all(bundleTasks);

  // Determine the transitive properties of each bundle: their import tree (for preload) and if
  // they must be re-compiled for i18n even _without_ messages.
  let rewrittenSources = 0;
  const rewriteTasks = [];

  for (const fileName in annotatedBundles) {
    const b = annotatedBundles[fileName];

    // Sanity-check that we don't have a transpiled chunk?!
    if (!b.entrypoint && b.transpile) {
      throw new TypeError(`got bad bundle with (!entrypoint && transpile): ${fileName}`);
    }

    // Mark all dependencies as _also_ needing i18n versions.
    const work = new Set(b.imports);
    for (const dep of work) {
      const o = annotatedBundles[dep];
      if (o.i18n) {
        b.i18n = true;
      }
      o.imports.forEach((i) => work.add(i));
    }
    b.allImports = Array.from(work);

    const attrs = [];
    b.entrypoint && attrs.push('entrypoint');
    b.i18n && attrs.push('i18n');
    b.transpile && attrs.push('transpile');

    const prettyAttrs = attrs.map((attr) => chalk.magenta(attr)).join(',');
    log(`Rewriting bundle ${chalk.yellow(fileName)} [${prettyAttrs}]...`);

    const derivedFiles = [];
    if (!b.i18n) {
      // There's no i18n or transitive language content.
      derivedFiles.push({rewrite: () => b.rewrite(null), fileName});
    } else {
      // Rewrite this module for each language.
      for (const lang in langs) {
        const langFileName = rewritePathForLang(fileName, lang);
        derivedFiles.push({rewrite: () => b.rewrite(lang), fileName: langFileName});
      }
    }

    // Now, optionally transpile.
    const bundleRewriteTasks = derivedFiles.map(async ({fileName, rewrite}) => {
      const ast = rewrite();
      const release = (code) => {
        if (yargs.minify) {
          // Optionally minify with Terser.
          const result = Terser.minify(code);
          if (result.error) {
            throw new TypeError(`Terser error on ${fileName}: ${result.error}`);
          }
          code = result.code;
        }
        releaseWriter.file(fileName, code);
        ++rewrittenSources;
      };

      // Don't transform, just use the generator to output directly.
      // (We could probably call transformFromAst with no arguments?)
      if (!b.transpile) {
        const {code} = generator.default(ast, {comments: false});
        release(code);
        return null;
      }

      log(`Transpiling ${chalk.yellow(fileName)}...`);
      const {code} = await babel.transformFromAst(ast, null, {
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['ie >= 11'],
            },
          }],
        ],
        plugins: ['@babel/plugin-transform-destructuring'],
      });

      // Finally, rewrite it _again_ as an IIFE. We expect a single output.
      const results = await modernBuilder({'x.js': code}, null, 'iife');
      const wrapped = results[0].code;
      release(wrapped);
    });

    rewriteTasks.push(...bundleRewriteTasks);
  }

  await Promise.all(rewriteTasks);
  log(`Rewrote ${chalk.cyan(rewrittenSources)} source files`);
  log(`Transpiled ${chalk.cyan(rewriteTasks.length)} source files`);

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
function createScript(src, type) {
  var node = document.createElement('script');
  node.src = src;
  type && node.setAttribute('type', type);
  document.head.appendChild(node);
}
(function() {
  var fallback = (location.search || '').match(/\\bfallback=1\\b/);
  fallback && createScript(${JSON.stringify(pathToSupport)});
  ${JSON.stringify(importIsTranslated)}.forEach(function(i18n, i) {
    var src = (fallback ? 'fallback-' : '') + i + (i18n ? '_' + document.documentElement.lang : '') + '.js';
    createScript(src, fallback ? null : 'module');
  });
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
        const url = `/images/og/${page}.png`;
        const all = [
          '[property="og:image"]',
          '[name="twitter:image"]',
        ];
        releaseHtml.applyAttributeToAll(head, all, 'content', url);
      }

      // nb. In 2019, titles are just e.g. "Santa's Canvas", not "Santa's Canvas - Google Santa
      // Tracker".
      const msgid = prodPages[page] || 'santatracker';
      const all = ['title', '[property="og:title"]', '[name="twitter:title"]'];
      releaseHtml.applyAttributeToAll(head, all, 'msgid', msgid);
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
