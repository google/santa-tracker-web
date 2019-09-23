#!/usr/bin/env node

/**
 * @fileoverview Builds Santa Tracker for release to production.
 */

const chalk = require('chalk');
const fsp = require('./build/fsp.js');
const globAll = require('./build/glob-all.js');
const i18n = require('./build/i18n.js');
const isUrl = require('./build/is-url.js');
const log = require('fancy-log');
const path = require('path');
const releaseHtml = require('./build/release-html.js');
const santaVfs = require('./santa-vfs.js');
const modernBuilder = require('./build/modern-builder.js');
const {JSDOM} = require('jsdom');

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
    })
    .option('prod', {
      type: 'boolean',
      default: true,
      describe: 'Whether to build prod',
    })
    .option('scene', {
      type: 'array',
      default: [],
      describe: 'If specified, only compile these scenes',
    })
    .argv;

const staticAssets = [
  'audio/*',
  'img/**/*',
  'third_party/**',
  'scenes/**/models/**',
  'scenes/**/img/**',

  // Explicitly include Web Components polyfill bundles, as they're injected at runtime rather than
  // being directly referenced by a `<script>`.
  'node_modules/@webcomponents/webcomponentsjs/bundles/*.js',
];

// nb. matches config in serve.js
const config = {
  staticScope: `${yargs.baseurl}${yargs.build}/`,
  version: yargs.build,
};

function prodPathForLang(lang) {
  if (lang === DEFAULT_LANG) {
    return '.';
  }
  return `intl/${lang}_ALL`
}

async function copy(src, dst) {
  await fsp.mkdirp(path.dirname(dst));
  await fsp.copyFile(src, dst);
}

function releaseAll(all, prefix=null) {
  const target = prefix ? path.join('dist', prefix) : 'dist';
  const copies = all.map((p) => copy(p, path.join(target, p)));
  return Promise.all(copies);
}

async function write(target, content) {
  await fsp.mkdirp(path.dirname(target));
  await fsp.writeFile(target, content);
}

async function release() {
  log(`Building Santa Tracker ${chalk.red(yargs.build)}...`);

  const staticRoot = (new URL(config.staticScope)).pathname;

  const staticDir = path.join('dist/static', yargs.build);
  await fsp.mkdirp(staticDir);
  await fsp.mkdirp('dist/prod');

  // Display the static URL plus the root (in a different color).
  if (!config.staticScope.endsWith(staticRoot)) {
    throw new TypeError(`invalid static resolution: ${config.staticScope} vs ${staticRoot}`)
  }
  log(`Static at ${chalk.green(config.staticScope)}`);

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
  const entrypoints = new Map();
  const requiredScriptSources = new Set();
  const messagesForHtmlFile = new Map();

  // Santa Tracker builds static by finding HTML entry points and parsing/rewriting each file,
  // including traversing their dependencies like CSS and JS. It doesn't specifically compile CSS 
  // or JS on its own, it must be included by one of our HTML entry points.
  const vfs = santaVfs(config.staticScope, {config});

  const htmlFiles = [];
  if (yargs.scene.length) {
    htmlFiles.push(...yargs.scene.map((scene) => path.join('static/scenes', scene, 'index.html')));
  } else {
    htmlFiles.push(...globAll('static/scenes/*/index.html'));
  }
  if (!htmlFiles.length) {
    throw new Error('no entrypoints matched')
  }

  const htmlDocuments = new Map();
  for (const htmlFile of htmlFiles) {
    const dir = path.dirname(htmlFile);
    const dom = new JSDOM(await fsp.readFile(htmlFile));
    const document = dom.window.document;

    htmlDocuments.set(htmlFile, dom);
    messagesForHtmlFile.set(htmlFile, new Set());

    // Find assets that are going to be inlined.
    const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')];
    const allScripts = Array.from(document.querySelectorAll('script')).filter((scriptNode) => {
      return !(scriptNode.src && isUrl(scriptNode.src));
    });

    // Inline all local referenced styles.
    for (const styleLink of styleLinks) {
      if (isUrl(styleLink.href)) {
        continue;  // TODO(samthor): mostly Google Fonts, but could be worth validating
      }
      const out = await vfs(path.join(dir, styleLink.href));
      const inlineStyleTag = document.createElement('style');
      inlineStyleTag.innerHTML = out.code;
      styleLink.replaceWith(inlineStyleTag);
    }

    // Find non-module scripts, as they contain dependencies like jQuery, THREE.js etc. These are
    // catalogued and then included in the static output.
    allScripts
        .filter((s) => s.src && (!s.type || s.type === 'text/javascript'))
        .map((s) => path.join(dir, s.src))
        .forEach((src) => requiredScriptSources.add(src));

    // Find all module scripts, so that all JS entrypoints can be catalogued and built together.
    const moduleScriptNodes = allScripts.filter((s) => s.type === 'module');
    for (const scriptNode of moduleScriptNodes) {
      let code = scriptNode.textContent;

      // If it's an external script, pretend that we have local code that imports it.
      if (scriptNode.src) {
        if (code) {
          throw new TypeError(`got invalid <script>: both code and src`);
        }
        let src = scriptNode.src;
        if (!src.startsWith('./')) {
          src = `./${src}`;
        }
        code = `import '${src}';`
      }
      const id = `${htmlFile}#${entrypoints.size}.js`;
      entrypoints.set(id, {scriptNode, code, htmlFile});

      // Clear scriptNode.
      scriptNode.textContent = '';
      scriptNode.removeAttribute('src');
    }
  }

  // Optionally include prod-required scripts.
  if (yargs.prod) {
    // FIXME: can we compile prod/ together with static/ ?
    const prodScripts = globAll('prod/*.js', 'static/entrypoint.js');
    for (const id of prodScripts) {
      entrypoints.set(id, {
        scriptNode: null,
        code: await fsp.readFile(id, 'utf8'),
        htmlFile: null,
      });
    }
  }

  log(`Found ${chalk.cyan(requiredScriptSources.size)} required script sources`)
  log(`Found ${chalk.cyan(entrypoints.size)} entrypoints`);

  const bundles = await modernBuilder(entrypoints, {
    loader: vfs,
    external(id) {
      if (id === 'static/src/magic.js') {
        return '__magic';
      }
    },
  });
  log(`Generated ${bundles.length} bundles`);

  // FIXME: We can probably just awkwardly swap the import names for i18n files. So it might
  // be possible to basically mark the leaves as "non-i18n" and leave them alone, BUT rewrite
  // the graph (load it in memory) for lang use.
  // OR just compile ~37 times. (gross)


  const babel = require('@babel/core');

  // FIXME: for now, do 2 passes. One for rewriting features if needed, one for i18n.

  for (const {code, fileName} of bundles) {
    // TODO: experiment with rewriting __magic.
    const transformed = await babel.transformAsync(code);
    console.info('transformed', fileName, transformed);
  }
  throw 'done';









  // Awkwardly insert rollup step in the middle of the release process.
  // TODO(samthor): refactor out?
  const rollup = require('rollup');
  const rollupNodeResolve = require('rollup-plugin-node-resolve');
  const terser = require('terser');
  const virtualCache = {};
  const virtualLoader = {
    name: 'rollup-virtual-loader-release',
    async resolveId(id, importer) {
      if (importer === undefined) {
        const data = entrypoints.get(id);
        virtualCache[id] = data.code;
        return id;
      }

      const data = entrypoints.get(importer);
      const resolved = path.resolve(data ? data.dir : path.dirname(importer), id);

      // try the loader
      const out = await loader(resolved, {compile: true});
      if (out) {
        virtualCache[resolved] = out.body.toString();
        return resolved;
      }
    },
    load(id) {
      return virtualCache[id];
    },
  };
  const bundle = await rollup.rollup({
    input: Array.from(entrypoints.keys()),
    plugins: [rollupNodeResolve(), virtualLoader],
  });

  const generated = await bundle.generate({
    format: 'es',
    chunkFileNames: 'c[hash].js',
  });
  log(`Generated ${chalk.cyan(Object.keys(generated.output).length)} total modules`);

  // const babel = require('@babel/core');
  // const buildTemplateTagReplacer = require('./build/babel/template-tag-replacer.js');

  let totalSizeES = 0;
  for (const filename in generated.output) {
    const {isEntry, code} = generated.output[filename];

    if (isEntry) {
      // TODO(samthor): can we determine the tree here and add preloads?
      const {scriptNode, dir} = entrypoints.get(filename);
      scriptNode.setAttribute('src', path.relative(dir, `src/${filename}`));
    }

    const templateTagReplacer = (name, arg, dirname) => {
      if (name === '_style') {
        const {css} = compileCss(path.join(dirname, `/${arg}.scss`), loaderOptions);
        return css;
      } else if (name === '_root') {
        return path.join(loaderOptions.root, arg);
      }
    };

    // Transpile down for the ES module high-water mark. This is the `type="module"` import above.
    const {code: transpiledForES} = await babel.transformAsync(code, {
      filename,
      presets: [
        ['@babel/preset-env', {
          targets: {esmodules: true},
          modules: false,
        }],
      ],
      plugins: [
        // include _style replacements as a byproduct
        buildTemplateTagReplacer(templateTagReplacer),
      ],
      sourceType: 'module',
    });
    const minifiedForES = terser.minify(transpiledForES);
    await write(path.join(staticDir, 'src', filename), minifiedForES.code);
    totalSizeES += minifiedForES.code.length;
  }
  log(`Written ${chalk.cyan(totalSizeES)} bytes of ES module code`);

  if (!yargs.transpile) {
    log(`Transpilation ${chalk.red('disabled')}, only support ES module browsers`);
  }

  // Generate ES5 versions of entrypoints.
  const babelPlugin = require('rollup-plugin-babel');
  for (const [filename, data] of entrypoints) {
    // Piggyback on ES5 transpilation process to get messages required for this HTML entrypoint.
    const messages = messagesForHtmlFile.get(data.htmlFile);
    const messageTagObserver = (name, arg) => {
      if (name === '_msg') {
        messages.add(arg);
      }
    };

    // Optionally skip transpilation.
    if (!yargs.transpile) {
      log(`Analyzing ${chalk.green(filename)} for ${chalk.green(data.htmlFile)}...`);
      await rollup.rollup({
        plugins: [
          babelPlugin({
            sourceMaps: false,
            compact: true,
            plugins: [
              buildTemplateTagReplacer(messageTagObserver),
            ],
          }),
        ],
        input: path.join(staticDir, 'src', filename),
      });
      continue;
    }
    log(`Transpiling ${chalk.green(filename)} for ${chalk.green(data.htmlFile)}...`);

    // TODO(samthor): fast-async adds boilerplate to all files, should be included with polyfills
    // https://github.com/MatAtBread/fast-async#runtimepattern
    const bundle = await rollup.rollup({
      plugins: [
        babelPlugin({
          sourceMaps: false,  // babel barfs on some large entrypoints
          compact: true,      // otherwise it prettyprints
          plugins: [
            buildTemplateTagReplacer(messageTagObserver),
            'module:fast-async',  // use fast-async over transform-regenerator
          ],
          presets: [
            ['@babel/preset-env', {
              targets: {browsers: 'ie >= 11'},
              exclude: ['transform-regenerator'],
            }],
          ],
        }),
      ],
      input: path.join(staticDir, 'src', filename),
    });
    const generated = await bundle.generate({format: 'es'});
    await write(path.join(staticDir, 'src', `_${filename}`), generated.code);

    // Add a new scriptNode before the ES6 node.
    const {scriptNode, dir} = data;
    const transpiledScriptNode = scriptNode.ownerDocument.createElement('script');
    transpiledScriptNode.toggleAttribute('nomodule', true);
    transpiledScriptNode.src = path.relative(dir, `src/_${filename}`);
    scriptNode.parentNode.insertBefore(transpiledScriptNode, scriptNode);
  }

  // Render i18n versions of static pages.
  for (const [htmlFile, document] of htmlDocuments) {
    const documentForLang = await releaseHtml.static(document);
    const dir = path.dirname(htmlFile);
    const fanout = (path.basename(htmlFile) === 'index.html');

    // If there were any messages required for this file, add a script node.
    const msgids = messagesForHtmlFile.get(htmlFile);
    const scriptNode = document.createElement('script');
    if (msgids.size) {
      if (!fanout) {
        throw new Error(`found msgid for non-index.html file: ${htmlFile}`)
      }
      document.head.insertBefore(scriptNode, document.head.firstChild);
    } else if (!fanout) {
      const target = path.join(staticDir, htmlFile);
      await write(target, documentForLang());
      continue;
    }

    for (const lang in langs) {
      const filename = `${lang}.html`;
      const target = path.join(staticDir, dir, filename);

      // Build the message lookup object. This won't be on the page if there's no messages.
      const lookup = langs[lang];
      const messages = {};
      for (const msgid of msgids) {
        messages[msgid] = lookup(msgid);
      }
      scriptNode.textContent =
          `var __msg=${JSON.stringify(messages)};function _msg(x){return __msg[x]}`;
      await write(target, documentForLang(lookup));
    }
  }

  // Copy everything else.
  const staticAll = globAll(...staticAssets).concat(...requiredScriptSources);
  log(`Copying ${chalk.cyan(staticAll.length)} static assets`);
  await releaseAll(staticAll, path.join('static', yargs.build));

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

  log(`Done!`);
}

async function releaseProd(langs) {
  // Fanout these scenes in prod.
  // TODO(samthor): This list should be bigger.
  const prodPages = (await fsp.readdir('./static/scenes')).filter((cand) => cand.match(/^[a-z  ]+/));
  prodPages.push('');
  log(`Found ${chalk.cyan(Object.keys(prodPages).length)} prod pages`);

  const prodAll = globAll('prod/**', '!prod/*.html', '!prod/manifest.json');
  await releaseAll(prodAll);

  // Match non-index.html prod pages, like cast, error etc.
  let prodHtmlCount = 0;
  const prodOtherHtml = globAll('prod/*.html', '!prod/index.html');
  for (const htmlFile of prodOtherHtml) {
    const documentForLang = await releaseHtml.prod(htmlFile);

    const tail = path.basename(htmlFile);
    for (const lang in langs) {
      const target = path.join('dist/prod', prodPathForLang(lang), tail);
      await write(target, documentForLang(langs[lang]));
      ++prodHtmlCount;
    }
  }

  // Fanout prod index.html to all scenes and langs.
  for (const page of prodPages) {
    const documentForLang = await releaseHtml.prod('prod/index.html', async (document) => {
      const head = document.head;

      const image = `prod/images/og/${page}.png`;
      if (await fsp.exists(image)) {
        const url = `/images/og/${page}.png`;
        const all = [
          '[property="og:image"]',
          '[name="twitter:image"]',
        ];
        releaseHtml.applyAttributeToAll(head, all, 'content', url);
      }

      // const msgid = msgidForScene(page, prodScenes[page]);
      const msgid = 'santatracker';  // FIXME: no msgid
      const all = ['title', '[property="og:title"]', '[name="twitter:title"]'];
      releaseHtml.applyAttributeToAll(head, all, 'msgid', msgid);
    });

    for (const lang in langs) {
      const filename = page ? `${page}.html` : 'index.html';
      const target = path.join('dist/prod', prodPathForLang(lang), filename);
      await write(target, documentForLang(langs[lang]));
      ++prodHtmlCount;
    }
  }

  log(`Written ${chalk.cyan(prodHtmlCount)} prod pages`);

  // Generate manifest.json for every language.
  const manifest = require('./prod/manifest.json');
  for (const lang in langs) {
    const messages = langs[lang];
    manifest['name'] = messages('santatracker');
    manifest['short_name'] = messages('santa-app');
    const target = path.join('dist/prod', prodPathForLang(lang), 'manifest.json');
    await write(target, JSON.stringify(manifest));
  }

  log(`Written ${chalk.cyan(Object.keys(langs).length)} manifest files`);
}

release().catch((err) => {
  console.warn(err);
  process.exit(1);
});
