/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/* jshint node: true */

const $ = require('gulp-load-plugins')();
const bundler = require('polymer-bundler');
const closureCompiler = require('google-closure-compiler').gulp();
const del = require('del');
const glob = require('glob');
const gulp = require('gulp');
const gutil = require('gulp-util');
const uglifyES = require('uglify-es');
const babel = require('babel-core');
const scripts = require('./gulp_scripts');
const dom5 = require('dom5');
const connect = require('connect');
const serveStatic = require('serve-static');

const fs = require('fs');
const path = require('path');

/* Default version is 'vYYYYMMDDHHMM'. */
const DEFAULT_STATIC_VERSION = 'v' + (new Date).toISOString().replace(/[^\d]/g, '').substr(0, 12);

const yargs = require('yargs')
    .help('shelp')  // gulp steals --help
    .strict()
    .epilogue('https://github.com/google/santa-tracker-web')
    .command('default', 'build CSS and JavaScript for development version')
    .command('serve', 'serves development version')
    .command('dist', 'build production version')
    .option('pretty', {
      type: 'boolean',
      default: false,
      describe: 'production output to dist_pretty',
    })
    .option('strict', {
      type: 'boolean',
      default: false,
      describe: 'perform strict i18n checks',
    })
    .option('api_base', {
      type: 'string',
      default: 'https://santa-api.appspot.com/',
      describe: 'base URL for Santa\'s API',
    })
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
    .option('scene', {
      type: 'string',
      default: '',
      describe: 'only compile JS for these scenes (e.g. scene1,scene2,scene3)',
    })
    .option('compile', {
      type: 'boolean',
      default: false,
      describe: 'force all scenes to compile with Closure in dev',
    })
    .option('port', {
      alias: 'p',
      type: 'number',
      default: 3000,
      describe: 'port to serve on',
    });
const argv = yargs.argv;

fs.writeFileSync('version', argv.build)

const SASS_FILES = '{scenes,sass,elements}/**/*.scss';
const IGNORE_COMPILED_JS = '!**/*.min.js';
const CLOSURE_FILES = ['scenes/*/js/**/*.js', IGNORE_COMPILED_JS];
const JS_FILES = ['js/*.js', 'js/externs/*.js', IGNORE_COMPILED_JS];

const AUTOPREFIXER_BROWSERS = ['> 3%', 'chrome >= 44', 'ios_saf >= 9', 'ie >= 11'];

const CLOSURE_WARNINGS = [
  // https://github.com/google/closure-compiler/wiki/Warnings
  'accessControls',
  'const',
  'visibility',
];
const CLOSURE_SAFE_WARNINGS = CLOSURE_WARNINGS.concat([
  'checkTypes',
  'checkVars',
]);

const API_BASE_URL = argv.api_base.replace(/\/*$/, '/');
const STATIC_BASE_URL = argv.baseurl.replace(/\/*$/, '/');
const STATIC_VERSION = argv.build;

const PROD_DIR = 'dist_prod';
const STATIC_DIR = 'dist_static';
const PRETTY_DIR = 'dist_pretty';

// path for files (mostly index_*.html) with short cache periods
const DIST_PROD_DIR = argv.pretty ? PRETTY_DIR : PROD_DIR;

// path for static resources
const DIST_STATIC_DIR = argv.pretty ? PRETTY_DIR : (STATIC_DIR + '/' + argv.build);

// Broad scene config for Santa Tracker.
const SCENE_CONFIG = require('./scenes');
const SCENE_FANOUT = Object.keys(SCENE_CONFIG).filter((key) => SCENE_CONFIG[key].fanout !== false);

// List of scene names to serve.
const ARG_SCENES = argv.scene.split(',').filter((sceneName) => sceneName);
const COMPILE_SCENES = (function() {
  if (!ARG_SCENES.length) {
    // compile all scenes
    return Object.keys(SCENE_CONFIG).filter((key) => SCENE_CONFIG[key].entryPoint);
  }
  const out = [];
  ARG_SCENES.forEach((scene) => {
    const config = SCENE_CONFIG[scene];
    if (!config) {
      throw new Error(`unknown scene: ${scene}`);
    }
    config.entryPoint && out.push(scene);
    out.push(...(config.dependencies || []));
  });
  return out;
}());

// Shared options for htmlmin.
const HTMLMIN_OPTIONS = {
  collapseWhitespace: true,
  minifyJS: (code, inline) => {
    const opts = {
      parse: {
        bare_returns: inline,
      },
    };
    // HTML minifier uses old uglify by default, force it to use uglifyES (ES6+ support)
    const result = uglifyES.minify(code, opts);
    if (result.error) {
      throw new Error('got error: ' + result.error);
    }
    return result.code;
  },
  minifyCSS: true,
  includeAutoGeneratedTags: false,
  keepClosingSlash: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  sortAttributes: true,
  sortClassName: true,
  collapseBooleanAttributes: false,  // if true, htmlmin will eat e.g. disabled="[[blah]]"
};

exports.help = function help(done) {
  yargs.showHelp();
  done();
};

exports.clean = function clean() {
  return del([
    '{scenes,sass,elements}/**/*.css',
    '{scenes,sass,elements}/**/*_module.html',
    'scenes/**/*.min.js',
    'js/*.min.js',
  ]);
};

exports.rmDist = function rmDist() {
  return del([PROD_DIR, STATIC_DIR, PRETTY_DIR]);
};

exports.sass = function sass() {
  return gulp.src(SASS_FILES, {base: '.'})  // nb. compile all sass files, it's fast
    .pipe($.dartSass({outputStyle: 'compressed'}).on('error', $.dartSass.logError))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(scripts.styleModules('_module'))
    .pipe($.changed('.', {hasChanged: $.changed.compareSha1Digest}))
    .pipe(gulp.dest('.'));
};

exports.compileJs = function compileJs() {
  const closureBasePath = path.resolve('components/closure-library/closure/goog/base.js');
  const externs = [
    'node_modules/google-closure-compiler/contrib/externs/google_universal_analytics_api.js',
  ];
  scripts.changedFlag('js/santa.min.js', API_BASE_URL);
  return gulp.src(JS_FILES)
    .pipe($.newer('js/santa.min.js'))
    .pipe(closureCompiler({
      js_output_file: 'santa.min.js',
      js: [closureBasePath],
      externs,
      compilation_level: 'ADVANCED_OPTIMIZATIONS',
      warning_level: 'VERBOSE',
      language_in: 'ECMASCRIPT6_STRICT',
      language_out: 'ECMASCRIPT5_STRICT',
      define: [`santaAPIRequest.BASE="${API_BASE_URL}"`],
      output_wrapper: '(function(){%output%}).call(window);',
      rewrite_polyfills: false,
      generate_exports: true,
      export_local_property_definitions: true,
    }, {
      platform: ['java'],
    }))
    .pipe(gulp.dest('js'));
};

exports.compileScenes = function compileScenes() {
  const closureLibraryPath = path.resolve('components/closure-library/closure/goog');
  const externs = [
    'components/web-animations-js/externs/web-animations.js',
    'components/web-animations-js/externs/web-animations-next.js',
    'node_modules/google-closure-compiler/contrib/externs/maps/google_maps_api_v3_exp.js',
    'node_modules/google-closure-compiler/contrib/externs/jquery-1.9.js',
  ];
  const limit = $.limiter(-2);
  const merged = scripts.merge();

  // compile each scene
  COMPILE_SCENES.map((sceneName) => {
    const config = SCENE_CONFIG[sceneName];
    const fileName = `${sceneName}-scene.min.js`;
    const dest = `scenes/${sceneName}`;

    let warnings = CLOSURE_SAFE_WARNINGS;
    let warningLevel = 'VERBOSE';
    if (config.typeSafe === false) {
      warnings = CLOSURE_WARNINGS;
      warningLevel = 'DEFAULT';
    }

    // All scenes need the compiler's base.js to get @export support. This is used in compilerFlags
    // since since it's essentially a static library (and to work around gulp-closure-compiler's
    // love of copying files to /tmp). Remove tests last, as the rules seem to be evaluated
    // left-to-right.
    const compilerSrc = [
      closureLibraryPath + (config.closureLibrary ? '/**.js' : '/base.js'),
      `!${closureLibraryPath}/**_test.js`,
    ];

    // Extra closure compiled libraries required by scene. Unfortunately, Closure Compiler does not
    // support standard bash glob '**/*.ext', only '**.ext' which bash/gulp does not support.
    const libraries = (config.libraries || []).map(lib => lib.replace('**/*', '**'));
    compilerSrc.push(...libraries);

    // Configure prefix and compilation options. In some cases (no libraries, not dist), we can
    // skip scene compilation for  more rapid development.
    // This flag is written to disk (via `scripts.changedFlag`), so a change forces a recompile.
    let prefixCode =
        'var global=window,app=this.app;var $jscomp=this[\'$jscomp\']={global:global};';
    const mustCompile =
        Boolean(argv.compile || libraries.length || config.closureLibrary || config.isFrame || config.es2015);
    if (!mustCompile) {
      // Add simple $jscomp methods needed for ES6 => ES5 transpilation.
      // (Most $jscomp helpers are added as part of --rewrite_polyfills, which we don't use, but
      // ES6 class transpilation is special.)
      prefixCode += `$jscomp.inherits=function(c,p){
              c.prototype=Object.create(p.prototype);
              c.prototype.constructor=c;
              Object.setPrototypeOf(c,p);
            };`.replace(/\s+/g, '');
    }

    // If some options are appended to the config, they seem to be ignored by the
    // options generator when invoking the Closure Compiler JAR.
    const prependOptions = config.es2015
        ? {
            new_type_inf: null
          }
        : {};

    const compilerFlags = Object.assign(prependOptions, {
      js_output_file: fileName,
      js: compilerSrc,
      externs,
      assume_function_wrapper: true,
      closure_entry_point: config.entryPoint,
      only_closure_dependencies: null,
      compilation_level: mustCompile ? 'SIMPLE_OPTIMIZATIONS' : 'WHITESPACE_ONLY',
      warning_level: warningLevel,
      language_in: 'ECMASCRIPT6_STRICT',
      language_out: 'ECMASCRIPT5_STRICT',
      process_closure_primitives: null,
      generate_exports: null,
      jscomp_warning: warnings,
      rewrite_polyfills: false,
      // scenes namespace themselves to `app.*`. Move this namespace into the global
      // `scenes.sceneName`, unless it's building for a frame. Note that this must be ES5.
      output_wrapper: config.isFrame ? '%output%' :
          `var scenes = scenes || {};\n` +
          `scenes.${sceneName} = scenes.${sceneName} || {};\n` +
          `(function(){${prefixCode}%output%}).call({app: scenes.${sceneName}});`,
    });

    const compilerStream = closureCompiler(compilerFlags);

    const target = `${dest}/${fileName}`;
    scripts.changedFlag(target, {mustCompile});

    return gulp.src([`scenes/${sceneName}/js/**/*.js`, 'scenes/shared/js/*.js'], {base: '.'})
        .pipe($.newer(target))
        .pipe(limit(compilerStream))
        .on('data', (file) => {
          if (file) {
            // if truthy, this is the minified output from Closure
            const message = mustCompile ? 'Compiled scene' : 'Fast transpiled';
            gutil.log(message, `'${gutil.colors.green(sceneName)}'`)
          }
        })
        .pipe(gulp.dest(dest));
  }).forEach((stream) => merged.add(stream));

  return merged;
};

exports.bundle = gulp.series(gulp.parallel(exports.sass, exports.compileJs, exports.compileScenes), async function bundle() {
  const primaryModuleName = 'elements/elements_en.html';   // index.html loads this import
  const excludes = ['elements/i18n-msg.html'];  // never include in output
  const paths = await new Promise((resolve, reject) => {
    glob('scenes/*/*-scene{,_en}.html', (err, files) => err ? reject(err) : resolve(files));
  });
  const entrypoints = paths.concat(primaryModuleName);

  // TODO(samthor): Better support for custom scenes (#1679).
  entrypoints.push('scenes/snowflake/snowflake-maker/turtle_en.html');

  // find all module entry points (elements, scenes, + any shared deps of scenes)
  const b = new bundler.Bundler({
    strategy: bundler.generateEagerMergeStrategy(primaryModuleName),
    urlMapper: bundler.generateCountingSharedBundleUrlMapper('elements/shared'),
    stripComments: true,
    excludes,
  });
  const manifest = await b.generateManifest(entrypoints);
  const result = await b.bundle(manifest);

  // log module size + generated count + contents of shared bundles
  const extra = Array.from(result.documents.keys())
      .filter((module) => !entrypoints.includes(module));
  gutil.log('Found', gutil.colors.yellow(result.documents.size), 'modules,',
      gutil.colors.yellow(extra.length), 'generated');
  extra.forEach((module) => {
    const bundle = result.manifest.bundles.get(module);
    gutil.log('Generated bundle', `'${gutil.colors.green(module)}'`,
        '\n· used by: ', Array.from(bundle.entrypoints).join(', '),
        '\n· includes:', Array.from(bundle.files).join(', '));
  });

  // bundle, CSP, and do language fanout
  const limit = $.limiter(-2);
  const stream = scripts.generateModules(result, [primaryModuleName].concat(excludes))
    .pipe(scripts.transformExternalScriptNodes(scriptNode => {
      if (dom5.getAttribute(scriptNode, 'type') === 'module') {
        // Removes the node:
        return null;
      }

      const newScriptNode = dom5.cloneNode(scriptNode);

      if (dom5.hasAttribute(scriptNode, 'nomodule')) {
        dom5.removeAttribute(newScriptNode, 'nomodule');
      }

      return newScriptNode;
    }))
    .pipe(scripts.transformInlineScripts(script => {
      return babel.transform(script, {
        presets: [['es2015', {
          modules: false
        }]]
      }).code;
    }))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(limit(scripts.crisper()))
    .on('data', (file) => {
      if (file && file.path.endsWith('.html')) {
        gutil.log('Bundled', `'${gutil.colors.green(file.path)}'`)
      }
    })
    .pipe(scripts.i18nReplace({
      strict: !!argv.strict,
      path: '_messages',
    }))
    stream.pipe(gulp.dest(DIST_STATIC_DIR));

  // promisify this stream, so the async promise waits until completion
  await new Promise((resolve, reject) => {
    stream.once('finish', resolve);
    stream.once('error', reject);
  });
});

exports.buildProd = function buildProd() {
  const staticUrl = argv.pretty ? '/' : (STATIC_BASE_URL + argv.build + '/');

  const entrypoints = ['index.html', 'error.html', 'upgrade.html', 'cast.html', 'embed.html'];
  const htmlStream = gulp.src(entrypoints)
    .pipe(scripts.mutateHTML.gulp(function() {

      if (!argv.pretty) {
        const dev = this.head.querySelector('#DEV');

        dev && dev.remove();
      }

      scripts.insertEs5Adapter(this, staticUrl);

      // Fix top-level HTML/CSS imports to include static base.
      const relativeLinks = Array.from(this.head.querySelectorAll('link:not([href^="/"])'));
      relativeLinks.forEach(link => {
        link.href = staticUrl + link.href;
      });

      this.body.setAttribute('data-static', staticUrl);
      this.body.setAttribute('data-version', STATIC_VERSION);
    }))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(scripts.fanout(SCENE_CONFIG))
    .pipe(scripts.i18nReplace({
      strict: !!argv.strict,
      path: '_messages',
    }))
    .pipe(gulp.dest(DIST_PROD_DIR));

  const jsStream = gulp.src(['sw.js'])
    .pipe($.replace('<STATIC_VERSION>', STATIC_VERSION))
    .pipe($.replace('<STATIC_HOST>', STATIC_BASE_URL))
    .pipe(gulp.dest(DIST_PROD_DIR));

  return scripts.merge(htmlStream, jsStream);
};

exports.buildProdManifest = function buildProdManifest() {
  return gulp.src(['manifest.json'])
    .pipe(scripts.i18nManifest({path: '_messages'}))
    .pipe(gulp.dest(DIST_PROD_DIR));
};

// copy needed assets (images, sounds, polymer elements, etc) to dist directories
exports.copyAssets = gulp.series(gulp.parallel(exports.bundle, exports.buildProd, exports.buildProdManifest), function copyAssets() {
  const staticStream = gulp.src([
    'audio/*',
    'images/**/*',
    '!images/og/*',  // don't include OG images, too large
    'third_party/**',
    'sass/*.css',
    'scenes/**/models/**/*.{gltf,bin,png}',
    'scenes/**/img/**/*.{png,jpg,svg,gif,cur,mp4}',
    'elements/**/img/**/*.{png,jpg,svg,gif,mp4}',
    'components/webcomponentsjs/*.js',
    'components/url/*.js',
    // TODO(samthor): Better support for custom scenes (#1679).
    'scenes/snowflake/snowflake-maker/{media,third-party}/**',
    'scenes/snowball/models/*'
  ], {base: './'})
    .pipe(gulp.dest(DIST_STATIC_DIR));

  // include misc assets from the top level of santatracker
  const prodStream = gulp.src([
    'sw-dummy.js',
    'robots.txt',
    'images/*',
    'images/og/*',
  ], {base: './'})
    .pipe(gulp.dest(DIST_PROD_DIR));

  return scripts.merge(staticStream, prodStream);
});

// builds a JSON manifest file containing files and hashes
exports.buildContents = gulp.series(exports.copyAssets, function buildContents() {
  const stream = scripts.fileManifest(STATIC_VERSION, DIST_STATIC_DIR);
  return gulp.src([`${DIST_STATIC_DIR}/**/*`])
    .pipe(stream)
    .pipe(gulp.dest(DIST_STATIC_DIR));
});

exports.announceDist = function announceDist(done) {
  gutil.log('Built version', gutil.colors.red(STATIC_VERSION));
  done();
};

// clean + build a distribution version
exports.dist = gulp.series(function dist(done) {
  if (!argv.compile) {
    gutil.log(gutil.colors.red('Warning!'),
        'Use', gutil.colors.green('--compile'), 'to build scenes for production');
    throw new Error(`you must specify --compile`);
  }
  done();

  // nb. 'build-contents' is our leaf here, as it depends on everything else. Be careful what deps
  // you list here, because they're not part of the normal Gulp dependency chain.
}, exports.rmDist, exports.buildContents, exports.announceDist);

exports.watch = function watch() {
  gulp.watch(SASS_FILES, exports.sass);
  gulp.watch(CLOSURE_FILES, exports.compileScenes);
  gulp.watch(JS_FILES, exports.compileJs);
};

exports.default = gulp.parallel(exports.sass, exports.compileJs, exports.compileScenes);

exports.serve = gulp.series(exports.default, gulp.parallel(exports.watch, function serve() {
  const livereloadFiles = ['**/*.css', '**/*.min.js', '**/*.html'];

  const simplePath = new RegExp(/^\/(\w+)\.html(|\?.*)$/);
  const fanoutHelper = function(req, res, next) {
    // If we match a file which would be a fanout of index.html in prod, serve index.html instead.
    const match = simplePath.exec(req.originalUrl);
    if (match && (SCENE_FANOUT.includes(match[1]) || 'unknown' === match[1])) {
      req.url = '/index.html';
    }
    return next();
  };

  const firstScene = ARG_SCENES[0];
  const browserSync = require('browser-sync').create();
  browserSync.init({
    files: livereloadFiles,
    watchOptions: {
      ignored: ['dist_static/', 'dist_prod/'],
    },
    injectChanges: false,
    middleware: [fanoutHelper],
    port: argv.port,
    server: ['.'],
    startPath: firstScene ? `/${firstScene}.html` : '/',
    ui: {port: argv.port + 1},
  });
}));

exports.serveProd = function serveProd(cb) {
  const prod = connect();

  prod.use(serveStatic(PROD_DIR, { index: 'index.html' }));
  prod.use(serveStatic(STATIC_DIR, { index: false }));

  prod.listen(argv.port);

  gutil.log(`Serving prod on port ${argv.port}`);
};

