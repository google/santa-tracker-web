#!/usr/bin/env node

/**
 * @fileoverview Builds Santa Tracker for release to production.
 */

const color = require('ansi-colors');
const compileCss = require('./build/compile-css.js');
const dom = require('./build/dom.js');
const fsp = require('./build/fsp.js');
const globAll = require('./build/glob-all.js');
const isUrl = require('./build/is-url.js');
const releaseHtml = require('./build/release-html.js');
const log = require('fancy-log');
const path = require('path');
const i18n = require('./build/i18n.js');
require('json5/lib/register');

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
    .option('default-lang', {
      type: 'string',
      default: 'en',
      describe: 'default top-level language',
    })
    .option('default-only', {
      alias: 'o',
      type: 'boolean',
      default: false,
      describe: 'only generate default top-level language',
    })
    .option('baseurl', {
      type: 'string',
      default: 'https://maps.gstatic.com/mapfiles/santatracker/',
      describe: 'URL to static content',
    })
    .option('prod', {
      type: 'string',
      default: 'https://santatracker.google.com/',
      describe: 'base prod URL',
    })
    .option('api-base', {
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
  'third_party/**',
  'scenes/**/models/**',
  'scenes/**/img/**',
  // TODO(samthor): Better support for custom scenes (#1679).
  // 'scenes/snowflake/snowflake-maker/{media,third-party}/**',
  // 'scenes/snowball/models/*',
];

const staticLoaderFiles = [
  'src/app/controller.bundle.js',
];

function pathForLang(lang) {
  if (lang === yargs.defaultLang) {
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

/**
 * @param {string} id of the scene
 * @param {?Object} info from scenes.js
 * @return {string} msgid to use for naming the scene
 */
function msgidForScene(id, info) {
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

async function release() {
  log(`Building Santa Tracker ${color.red(yargs.build)}...`);

  const staticDir = path.join('dist/static', yargs.build);
  await fsp.mkdirp(staticDir);
  await fsp.mkdirp('dist/prod');

  const staticAttr = `${yargs.baseurl}${yargs.build}/`;
  const staticRoot = (new URL(staticAttr)).pathname;
  const staticAttrForLang = (lang) => {
    return lang ? `${staticAttr}${lang}.html` : staticAttr;
  };

  // Display the static URL plus the root (in a different color).
  if (!staticAttr.endsWith(staticRoot)) {
    throw new TypeError(`invalid static resolution: ${staticAttr} vs ${staticRoot}`)
  }
  const leftPart = staticAttr.substr(0, staticAttr.length - staticRoot.length);
  log(`Static at ${color.green(leftPart)}${color.greenBright(staticRoot)}`);

  // Find the list of languages by reading `_messages`.
  const missingMessages = {};
  const langs = i18n.all((lang, msgid) => {
    if (!(msgid in missingMessages)) {
      missingMessages[msgid] = new Set();
    }
    missingMessages[msgid].add(lang);
  });
  if (!(yargs.defaultLang in langs)) {
    throw new Error(`default lang '${yargs.defaultLang}' not found in _messages`);
  }
  if (yargs.defaultOnly) {
    Object.keys(langs).forEach((otherLang) => {
      if (otherLang !== yargs.defaultLang) {
        delete langs[otherLang];
      }
    });
  }
  log(`Found ${color.cyan(Object.keys(langs).length)} languages`);

  // Fanout these scenes in prod.
  const scenes = require('./scenes.json5');
  log(`Found ${color.cyan(Object.keys(scenes).length)} scenes`);

  // Release all non-HTML prod assets.
  const prodAll = globAll('prod/**', '!prod/*.html', '!prod/manifest.json');
  await releaseAll(prodAll);

  // Match non-index.html prod pages, like cast, error etc.
  let prodHtmlCount = 0;
  const prodOtherHtml = globAll('prod/*.html', '!prod/index.html');
  for (const htmlFile of prodOtherHtml) {
    const documentForLang = await releaseHtml.prod(htmlFile);

    const tail = path.basename(htmlFile);
    for (const lang in langs) {
      const target = path.join('dist/prod', pathForLang(lang), tail);
      const out = documentForLang(langs[lang], (document) => {
        releaseHtml.applyAttribute(document.body, 'data-static', staticAttrForLang(lang));
      });
      await write(target, out);
      ++prodHtmlCount;
    }
  }

  // Fanout prod index.html to all scenes and langs.
  for (const sceneName in scenes) {
    const documentForLang = await releaseHtml.prod('prod/index.html', async (document) => {
      const head = document.head;
      releaseHtml.applyAttribute(document.body, 'data-version', yargs.build);

      const image = `prod/images/og/${sceneName}.png`;
      if (await fsp.exists(image)) {
        const url = `${yargs.prod}images/og/${sceneName}.png`;
        const all = [
          '[property="og:image"]',
          '[name="twitter:image"]',
        ];
        releaseHtml.applyAttributeToAll(head, all, 'content', url);
      }

      const msgid = msgidForScene(sceneName, scenes[sceneName]);
      const all = ['title', '[property="og:title"]', '[name="twitter:title"]'];
      releaseHtml.applyAttributeToAll(head, all, 'msgid', msgid);
    });

    for (const lang in langs) {
      const filename = sceneName === '' ? 'index.html' : `${sceneName}.html`;
      const target = path.join('dist/prod', pathForLang(lang), filename);
      const out = documentForLang(langs[lang], (document) => {
        releaseHtml.applyAttribute(document.body, 'data-static', staticAttrForLang(lang));
      });
      await write(target, out);
      ++prodHtmlCount;
    }
  }

  log(`Written ${color.cyan(prodHtmlCount)} prod HTML files`);

  // Generate manifest.json for every language.
  const manifest = require('./prod/manifest.json');
  for (const lang in langs) {
    const messages = langs[lang];
    manifest['name'] = messages('santatracker');
    manifest['short_name'] = messages('santa');
    const target = path.join('dist/prod', pathForLang(lang), 'manifest.json');
    await write(target, JSON.stringify(manifest));
  }

  // Shared resources needed by prod build.
  const entrypoints = new Map();
  const requiredScriptSources = new Set();
  const messagesForHtmlFile = new Map();

  // Santa Tracker builds static by finding HTML entry points and parsing/rewriting each file,
  // including traversing their dependencies like CSS and JS. It doesn't specifically compile CSS 
  // or JS on its own, it must be included by one of our HTML entry points.
  const loaderOptions = {compile: true, root: staticRoot};
  const loader = require('./loader.js')(loaderOptions);
  const htmlFiles = globAll('index.html', 'scenes/*/index.html', 'controller/*.html');
  const htmlDocuments = new Map();
  for (const htmlFile of htmlFiles) {
    const dir = path.dirname(htmlFile);
    const document = await dom.read(htmlFile);
    htmlDocuments.set(htmlFile, document);
    messagesForHtmlFile.set(htmlFile, new Set());

    const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')];
    const allScripts = Array.from(document.querySelectorAll('script')).filter((scriptNode) => {
      return !(scriptNode.src && isUrl(scriptNode.src));
    });

    // Add release/build notes to HTML.
    document.body.setAttribute('data-version', yargs.build);
    const devNode = document.getElementById('DEV');
    devNode && devNode.remove();

    // Inline all referenced styles which are available locally.
    for (const styleLink of styleLinks) {
      if (isUrl(styleLink.href)) {
        continue;
      }
      const out = await loader(path.join(dir, styleLink.href), {compile: true});
      const inlineStyleTag = document.createElement('style');
      inlineStyleTag.innerHTML = out.body;
      styleLink.parentNode.replaceChild(inlineStyleTag, styleLink);
    }

    // Find non-module scripts, as they contain dependencies like jQuery, THREE.js etc. These are
    // catalogued and then included in the production output.
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
        let src = scriptNode.src;
        if (!src.startsWith('./')) {
          src = `./${src}`;
        }
        code = `import '${src}';`
      }
      const id = `e${entrypoints.size}.js`;
      entrypoints.set(id, {scriptNode, dir, code, htmlFile});

      // Clear scriptNode.
      scriptNode.textContent = '';
      scriptNode.removeAttribute('src');
    }
  }
  log(`Found ${color.cyan(entrypoints.size)} module entrypoints`);

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
    experimentalCodeSplitting: true,
    input: Array.from(entrypoints.keys()),
    plugins: [rollupNodeResolve(), virtualLoader],
  });

  const generated = await bundle.generate({
    format: 'es',
    chunkFileNames: 'c[hash].js',
  });
  log(`Generated ${color.cyan(Object.keys(generated.output).length)} total modules`);

  const babel = require('@babel/core');
  const buildTemplateTagReplacer = require('./build/babel/template-tag-replacer.js');

  let totalSizeES = 0;
  for (const filename in generated.output) {
    const {isEntry, code} = generated.output[filename];

    if (isEntry) {
      // TODO(samthor): can we determine the tree here and add preloads?
      const {scriptNode, dir} = entrypoints.get(filename);
      scriptNode.setAttribute('src', path.relative(dir, `src/${filename}`));
    }

    const templateTagReplacer = (name, arg) => {
      if (name === '_style') {
        const {css} = compileCss(`styles/${arg}.scss`, loaderOptions);
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
  log(`Written ${color.cyan(totalSizeES)} bytes of ES module code`);

  // Generate ES5 versions of entrypoints.
  const babelPlugin = require('rollup-plugin-babel');
  for (const [filename, data] of entrypoints) {
    log(`Transpiling ${color.green(filename)} for ${color.green(data.htmlFile)}...`);

    // Piggyback on ES5 transpilation process to get messages required for this HTML entrypoint.
    const messages = messagesForHtmlFile.get(data.htmlFile);
    const messageTagObserver = (name, arg) => {
      if (name === '_msg') {
        messages.add(arg);
      }
    };

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
        throw new Error(`i18n required for non-index.html file: ${htmlFile}`)
      }
      document.head.insertBefore(scriptNode, document.head.firstChild);
    } else if (fanout) {
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

  // Special-case some loaded code.
  for (const loaderFile of staticLoaderFiles) {
    const out = await loader(loaderFile);
    await write(path.join(staticDir, loaderFile), out.body);
  }

  // Copy everything else.
  const staticAll = globAll(...staticAssets).concat(...requiredScriptSources);
  log(`Copying ${color.cyan(staticAll.length)} static assets`);
  await releaseAll(staticAll, path.join('static', yargs.build));

  // Display information about missing messages.
  const missingMessagesKeys = Object.keys(missingMessages);
  if (missingMessagesKeys.length) {
    log(`Missing ${color.red(missingMessagesKeys.length)} messages:`);
    missingMessagesKeys.forEach((msgid) => {
      const missingLangs = missingMessages[msgid];
      const ratio = (missingLangs.size / Object.keys(langs).length * 100).toFixed() + '%';
      const rest = (missingLangs.size <= 10) ? `[${[...missingLangs]}]` : '';
      console.info(color.yellow(msgid), 'for', color.red(ratio), 'of langs', rest);
    });
  }

  log(`Done!`);
}

release().catch((err) => {
  console.warn(err);
  process.exit(1);
});
