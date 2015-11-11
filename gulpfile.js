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

var gulp = require('gulp');
var gutil = require('gulp-util');
var vulcanize = require('gulp-vulcanize');
var sass = require('gulp-sass');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var foreach = require('gulp-foreach');
var del = require('del');
var i18n_replace = require('./gulp_scripts/i18n_replace');
var closureCompiler = require('gulp-closure-compiler');
var mergeStream = require('merge-stream');
var replace = require('gulp-replace');
var newer = require('gulp-newer');
var browserSync = require('browser-sync').create();

var STATIC_VERSION = 80;

var argv = require('yargs')
    .help('help')
    .epilogue('https://github.com/google/santa-tracker-web')
    .command('serve', 'serves development version')
    .command('dist', 'build production version')
    .option('pretty', {
      type: 'boolean',
      default: false,
      describe: 'production output to dist_pretty'
    })
    .option('strict', {
      type: 'boolean',
      default: false,
      describe: 'perform strict i18n checks'
    })
    .option('api_base', {
      type: 'string',
      default: 'https://santa-api.appspot.com/',
      describe: 'base URL for Santa\'s API'
    })
    .option('build', {
      type: 'string',
      default: '' + STATIC_VERSION,
      describe: 'production build tag'
    })
    .option('baseurl', {
      type: 'string',
      default: '',
      describe: 'production base href'
    })
    .option('scene', {
      type: 'string',
      default: null,
      describe: 'only build assets for this scene'
    })
    .argv;

var COMPILER_PATH = 'components/closure-compiler/compiler.jar';
var SASS_FILES = '{scenes,sass,elements}/**/*.scss';
var CLOSURE_FILES = 'scenes/*/js/**/*.js';

var SHARED_EXTERNS = [
  'third_party/externs/jquery/*.js',
  'third_party/externs/*.js',
  'components/web-animations-utils/externs*.js'
];

var AUTOPREFIXER_BROWSERS = ['> 2%', 'IE >= 10'];

var CLOSURE_WARNINGS = [
  // https://github.com/google/closure-compiler/wiki/Warnings
  'accessControls',
  'const',
  'visibility'
];
var CLOSURE_SAFE_WARNINGS = CLOSURE_WARNINGS.concat([
  'checkTypes',
  'checkVars'
]);

var API_BASE_URL = argv.api_base.replace(/\/*$/, '/');
var STATIC_BASE_URL = argv.baseurl.replace(/\/*$/, '/');
var STATIC_URL = argv.pretty ? '' : (STATIC_BASE_URL + argv.build + '/');

var PROD_DIR = 'dist_prod';
var STATIC_DIR = 'dist_static';
var PRETTY_DIR = 'dist_pretty';

// path for files (mostly index_*.html) with short cache periods
var DIST_PROD_DIR = argv.pretty ? PRETTY_DIR : PROD_DIR;

// path for static resources
var DIST_STATIC_DIR = argv.pretty ? PRETTY_DIR : (STATIC_DIR + '/' + argv.build);

// Broad scene config for Santa Tracker.
// Note! New scenes must be typeSafe (which is the default, so omit typeSafe:
// false). This will correctly typecheck Closure annotations.
var SCENE_CLOSURE_CONFIG = {
  airport: {
    typeSafe: false,
    entryPoint: 'app.Belt'
  },
  boatload: {
    entryPoint: 'app.Game'
  },
  briefing: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  callfromsanta: {
    entryPoint: 'app.Scene'
  },
  citylights: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  codelab: {
    typeSafe: false,
    entryPoint: 'app.FrameWrapper',
    dependencies: ['codelabframe']
  },
  codelabframe: {
    closureLibrary: true,
    typeSafe: false,
    entryPoint: 'app.Game',
    wrapClosure: false
  },
  commandcentre: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  factory: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  glider: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  gumball: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  jamband: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  jetpack: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  latlong: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  matching: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  playground: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  postcard: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  presentdrop: {
    entryPoint: 'app.Game'
  },
  mercator: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  racer: {
    entryPoint: 'app.Game'
  },
  runner: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  santaselfie: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  seasonofgiving: {
    typeSafe: false,
    closureLibrary: true,
    entryPoint: 'app.Game'
  },
  streetview: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  translations: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  },
  trivia: {
    typeSafe: false,
    entryPoint: 'app.Game'
  },
  windtunnel: {
    typeSafe: false,
    entryPoint: 'app.Scene'
  }
};

// List of scene names to compile.
var SCENE_NAMES = argv.scene ?
    [argv.scene].concat(SCENE_CLOSURE_CONFIG[argv.scene].dependencies || [] ) :
    Object.keys(SCENE_CLOSURE_CONFIG);
// A glob pattern matching scenes to compile.
var SCENE_GLOB = argv.scene ? '{' + SCENE_NAMES.join(',') + '}' : '*';

gulp.task('clean', function(cleanCallback) {
  del([
    '{scenes,sass,elements}/**/*.css',
    'scenes/*/*.min.js',
    'js/service/*.min.js',
  ], cleanCallback);
});

gulp.task('rm-dist', function(rmCallback) {
  del([PROD_DIR, STATIC_DIR, PRETTY_DIR], rmCallback);
});

gulp.task('sass', function() {
  var files = argv.scene ? 'scenes/' + SCENE_GLOB + '/**/*.scss' : SASS_FILES;
  return gulp.src(files, {base: '.'})
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('compile-santa-api-service', function() {
  return gulp.src([
    'js/service/*.js',
    '!js/service/externs.js',
    '!js/service/*.min.js',
  ])
    .pipe(newer('js/service/service.min.js'))
    .pipe(closureCompiler({
      compilerPath: COMPILER_PATH,
      fileName: 'service.min.js',
      compilerFlags: addCompilerFlagOptions({
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        // warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT5_STRICT',
        externs: SHARED_EXTERNS.concat('js/service/externs.js'),
        define: ['crossDomainAjax.BASE="' + API_BASE_URL + '"'],
        jscomp_warning: [
          // https://github.com/google/closure-compiler/wiki/Warnings
          'accessControls',
          'const',
          'visibility'
        ],
      })
    }))
    .pipe(gulp.dest('js/service'));
});

gulp.task('compile-scenes', function() {
  // compile each scene, merging them into a single gulp stream as we go
  return SCENE_NAMES.reduce(function(stream, sceneName) {
    var config = SCENE_CLOSURE_CONFIG[sceneName];
    var fileName = sceneName + '-scene.min.js';
    var dest = 'scenes/' + sceneName;
    var closureLibraryPath = path.resolve('components/closure-library/closure/goog');

    var warnings = CLOSURE_SAFE_WARNINGS;
    var warningLevel = 'VERBOSE';
    if (config.typeSafe === false) {
      warnings = CLOSURE_WARNINGS;
      warningLevel = 'DEFAULT';
    }

    // All scenes need Closure's base.js to get @export support. This is used in
    // compilerFlags since it's essentially a static library (and to work around
    // gulp-closure-compiler's love of copying files to /tmp).
    var compilerSrc = [closureLibraryPath + '/base.js',
        '!' + closureLibraryPath + '/**_test.js'];
    if (config.closureLibrary === true) {
      compilerSrc.push(closureLibraryPath + '/**.js');
    }

    return stream.add(gulp.src([
      'scenes/' + sceneName + '/js/**/*.js',
      'scenes/shared/js/*.js',
    ])
    .pipe(newer(dest + '/' + fileName))
    .pipe(closureCompiler({
      compilerPath: COMPILER_PATH,
      continueWithWarnings: true,
      fileName: fileName,
      compilerFlags: addCompilerFlagOptions({
        js: compilerSrc,
        externs: SHARED_EXTERNS,
        closure_entry_point: config.entryPoint,
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        warning_level: warningLevel,
        language_in: 'ECMASCRIPT5_STRICT',
        process_closure_primitives: null,
        generate_exports: null,
        jscomp_warning: warnings,
        only_closure_dependencies: null,
        // scenes namespace themselves to `app.*`. Move this namespace into
        // the global `scenes.sceneName`
        output_wrapper: config.wrapClosure === false ? '%output%' :
            'var scenes = scenes || {};\n' +
            'scenes.' + sceneName + ' = scenes.' + sceneName + ' || {};\n' +
            '(function(){%output%}).call({ app: scenes.' + sceneName + ' });'
      })
    }))
    .pipe(gulp.dest(dest)));
  }, mergeStream());
});

function addCompilerFlagOptions(opts) {
  // Add any compiler options specified by command line flags.
  if (argv.pretty) {
    opts.formatting = 'PRETTY_PRINT';
  }
  return opts;
}

gulp.task('vulcanize-scenes', ['rm-dist', 'sass', 'compile-scenes'], function() {
  // These are the 'common' elements inlined in elements_en.html. They can be
  // safely stripped (i.e., not inlined) from all scenes.
  // TODO(samthor): Automatically list inlined files from elements_en.html.
  var elementsImports = [
    'js/jquery.html',
    'js/modernizr.html',
    'js/webanimations.html',
    'components/polymer/polymer.html',
    'scenes/scene-behavior.html',
    'elements/i18n-msg.html',
    'components/iron-jsonp-library/iron-jsonp-library.html',
    'components/iron-a11y-keys/iron-a11y-keys.html',
    'components/google-apis/google-client-loader.html',
    'components/google-apis/google-maps-api.html',
    'components/google-apis/google-js-api.html', // tracker
    'components/google-apis/google-legacy-loader.html',
    'components/google-apis/google-plusone-api.html', // tracker
    'components/google-apis/google-youtube-api.html', // tracker
    'components/iron-selector/iron-selector.html',
    'components/iron-pages/iron-pages.html',
    'components/paper-item/paper-item.html'
  ];
  return gulp.src([
      'scenes/*/*-scene*.html'
    ], {base: './'})
    // gulp-vulcanize doesn't currently handle multiple files in multiple
    // directories well right now, so vulcanize them one at a time
    .pipe(foreach(function(stream, file) {
      var dest = path.dirname(path.relative(__dirname, file.path));
      return stream.pipe(vulcanize({
        // TODO(samthor): strip and csp were deprecated in gulp-vulcanize 1+
        stripExcludes: elementsImports,
        inlineScripts: true,
        inlineCss: true,
        stripComments: true,
        dest: dest
      }))
      .pipe(i18n_replace({
        strict: !!argv.strict,
        path: '_messages',
      }))
      .pipe(gulp.dest(DIST_STATIC_DIR));
    }));
});

gulp.task('vulcanize-codelab-frame', ['rm-dist', 'sass', 'compile-scenes'], function() {
  return gulp.src('scenes/codelab/codelab-frame_en.html', {base: './'})
    .pipe(argv.pretty ? gutil.noop() : replace(/window\.DEV ?= ?true.*/, ''))
    .pipe(vulcanize({
      // TODO(samthor): strip and csp were deprecated in gulp-vulcanize 1+
      // Note that this is a separate build as the codelab frame is its own
      // world: it requires all imports as part of its vulcanized output.
      inlineScripts: true,
      inlineCss: true,
      stripComments: true,
      dest: 'scenes/codelab'
    }))
    .pipe(i18n_replace({
      strict: !!argv.strict,
      path: '_messages'
    }))
    .pipe(gulp.dest(DIST_STATIC_DIR));
});

// Vulcanize elements separately, as we want to inline the majority common code
// here.
gulp.task('vulcanize-elements', ['rm-dist', 'sass', 'compile-santa-api-service'], function() {
  return gulp.src('elements/elements_en.html', {base: './'})
    .pipe(vulcanize({
      // TODO(samthor): strip and csp were deprecated in gulp-vulcanize 1+
      inlineScripts: true,
      inlineCss: true,
      stripComments: true,
      dest: 'elements'
    }))
    .pipe(i18n_replace({
      strict: !!argv.strict,
      path: '_messages',
    }))
    .pipe(gulp.dest(DIST_STATIC_DIR));
});

gulp.task('vulcanize', ['vulcanize-scenes', 'vulcanize-elements', 'vulcanize-codelab-frame']);

gulp.task('i18n_index', function() {
  return gulp.src(['index.html', 'error.html', 'upgrade.html'])
    .pipe(argv.pretty ? gutil.noop() : replace(/window\.DEV ?= ?true.*/, ''))
    .pipe(replace('<base href="">',
        '<base href="' + STATIC_URL + '">'))
    .pipe(i18n_replace({
      strict: !!argv.strict,
      path: '_messages',
    }))
    .pipe(gulp.dest(DIST_PROD_DIR));
});

// copy needed assets (images, sounds, polymer elements, etc) to dist directories
gulp.task('copy-assets', ['rm-dist', 'vulcanize', 'i18n_index'], function() {
  var staticStream = gulp.src([
    'manifest.json',
    'audio/*',
    'images/*.{png,svg,jpg,gif,ico}',
    'third_party/**',
    'sass/*.css',
    'scenes/**/img/**/*.{png,jpg,svg,gif,cur}',
    'elements/**/img/*.{png,jpg,svg,gif}',
    'components/webcomponentsjs/webcomponents-lite.min.js',
  ], {base: './'})
  .pipe(gulp.dest(DIST_STATIC_DIR));

  var prodStream = gulp.src([
    'images/og.png',
    'embed.js'
  ], {base: './'})
  .pipe(gulp.dest(DIST_PROD_DIR));

  return mergeStream(staticStream, prodStream);
});

// alias to build a distribution version
gulp.task('dist', ['copy-assets']);

gulp.task('watch', function() {
  gulp.watch(SASS_FILES, ['sass']);
  gulp.watch(CLOSURE_FILES, ['compile-scenes']);
});

gulp.task('serve', ['sass', 'compile-scenes', 'watch'], function() {
  browserSync.init({
    server: '.',
    startPath: argv.scene && '/#' + argv.scene
  });

  gulp.watch('{scenes,elements,sass}/**/*.css').on('change', browserSync.reload);
  gulp.watch('scenes/**/*.min.js').on('change', browserSync.reload);
  gulp.watch('js/**/*.js').on('change', browserSync.reload);
  gulp.watch('scenes/**/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['serve']);
