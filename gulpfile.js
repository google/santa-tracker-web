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
var compass = require('gulp-compass');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var foreach = require('gulp-foreach');
var del = require('del');
var i18n_replace = require('./gulp_scripts/i18n_replace');
var closureCompiler = require('gulp-closure-compiler');
var mergeStream = require('merge-stream');
var argv = require('yargs').argv;
var replace = require('gulp-replace');
var newer = require('gulp-newer');

var COMPILER_PATH = 'components/closure-compiler/compiler.jar';
var COMPASS_FILES = '{scenes,sass,elements}/**/*.scss';
var CLOSURE_FILES = 'scenes/*/js/**/*.js';

var STATIC_VERSION = 80;
var VERSION = argv.build || STATIC_VERSION;

var STATIC_BASE_URL = argv.baseurl ? argv.baseurl : '';
var STATIC_URL = argv.pretty ? '' : (STATIC_BASE_URL + VERSION + '/');

var PROD_DIR = 'dist_prod';
var STATIC_DIR = 'dist_static';
var PRETTY_DIR = 'dist_pretty';

// path for files (mostly index_*.html) with short cache periods
var DIST_PROD_DIR = argv.pretty ? PRETTY_DIR : PROD_DIR;

// path for static resources
var DIST_STATIC_DIR = argv.pretty ? PRETTY_DIR : (STATIC_DIR + '/' + VERSION);

// scenes are whitelisted into compilation here
var SCENE_CLOSURE_CONFIG = {
  airport: {
    entryPoint: 'app.Belt'
  },
  boatload: {
    entryPoint: 'app.Game'
  },
  briefing: {
    entryPoint: 'app.Scene'
  },
  callfromsanta: {
    entryPoint: 'app.Scene'
  },
  citylights: {
    entryPoint: 'app.Scene'
  },
  codelab: {
    entryPoint: 'app.wrapper.FrameWrapper'
  },
  commandcentre: {
    entryPoint: 'app.Scene'
  },
  factory: {
    entryPoint: 'app.Scene'
  },
  glider: {
    entryPoint: 'app.Game'
  },
  gumball: {
    entryPoint: 'app.Game'
  },
  jamband: {
    entryPoint: 'app.Game'
  },
  jetpack: {
    entryPoint: 'app.Game'
  },
  latlong: {
    entryPoint: 'app.Game'
  },
  matching: {
    entryPoint: 'app.Game'
  },
  playground: {
    entryPoint: 'app.Scene'
  },
  postcard: {
    entryPoint: 'app.Scene'
  },
  presentdrop: {
    entryPoint: 'app.Game'
  },
  mercator: {
    entryPoint: 'app.Game'
  },
  racer: {
    entryPoint: 'app.Game'
  },
  runner: {
    entryPoint: 'app.Game'
  },
  santaselfie: {
    entryPoint: 'app.Game'
  },
  seasonofgiving: {
    entryPoint: 'app.Game',
  },
  streetview: {
    entryPoint: 'app.Scene'
  },
  translations: {
    entryPoint: 'app.Scene'
  },
  trivia: {
    entryPoint: 'app.Game'
  },
  windtunnel: {
    entryPoint: 'app.Scene'
  }
};

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

gulp.task('compass', function() {
  return gulp.src(COMPASS_FILES)
    .pipe(compass({
      project: path.join(__dirname, '/'),
      css: '',
      sass: '',
      environment: 'production',
    }))

    // NOTE: autoprefixes css properties that need it
    .pipe(autoprefixer({}))
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
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        // warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT5_STRICT',
        externs: ['js/service/externs.js', 'third_party/externs/jquery/jquery-1.8.js'],
        define: ['crossDomainAjax.BASE="' + (argv.api_base || 'https://santa-api.appspot.com/') + '"'],
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

gulp.task('compile-scenes', ['compile-codelab-frame'], function() {
  var sceneNames = Object.keys(SCENE_CLOSURE_CONFIG);
  // compile each scene, merging them into a single gulp stream as we go
  return sceneNames.reduce(function(stream, sceneName) {
    var config = SCENE_CLOSURE_CONFIG[sceneName];
    var fileName = sceneName + '-scene.min.js';
    var dest = 'scenes/' + sceneName;

    return stream.add(gulp.src([
      'scenes/' + sceneName + '/js/**/*.js',

      // add shared scene code
      'scenes/shared/js/*.js',

      // these externs are annotated with @externs, so we can import them as
      // source (so we can use use wildcards in the file name)
      'third_party/externs/jquery/*.js',
    ])
    .pipe(newer(dest + '/' + fileName))
    .pipe(closureCompiler({
      compilerPath: COMPILER_PATH,
      fileName: fileName,
      compilerFlags: addCompilerFlagOptions({
        // all scenes need closure's base.js to get @export support, some need
        // full closure library (like seasonofgiving)
        // In compilerFlags since it's essentially a static library (and to work
        // around gulp-closure-compiler's love of copying files to /tmp).
        js: path.resolve('components/closure-library/closure/goog/**.js'),
        closure_entry_point: config.entryPoint,
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        // warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT5_STRICT',
        process_closure_primitives: null,
        generate_exports: null,
        jscomp_warning: [
          // https://github.com/google/closure-compiler/wiki/Warnings
          'accessControls',
          'const',
          'visibility'
        ],
        only_closure_dependencies: null,
        // scenes namespace themselves to `app.*`. Move this namespace into
        // the global `scenes.sceneName`
        output_wrapper:
            'var scenes = scenes || {};\n' +
            'scenes.' + sceneName + ' = scenes.' + sceneName + ' || {};\n' +
            '(function(){%output%}).call({ app: scenes.' + sceneName + ' });'
      })
    }))
    .pipe(gulp.dest(dest)));
  }, mergeStream());
});

gulp.task('compile-codelab-frame', function() {
  var dest = 'scenes/codelab';
  var fileName = 'codelab-frame.min.js';

  return gulp.src([
      'scenes/codelab/js/**/*.js',

      // add shared scene code
      'scenes/shared/js/*.js',

      // add closure library
      'components/closure-library/closure/goog/**/*.js'
    ])
    .pipe(newer(dest + '/' + fileName))
    .pipe(closureCompiler({
      compilerPath: COMPILER_PATH,
      fileName: fileName,
      compilerFlags: addCompilerFlagOptions({
        closure_entry_point: 'app.Game',
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        // warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT5_STRICT',
        process_closure_primitives: null,
        generate_exports: null,
        jscomp_warning: [
          // https://github.com/google/closure-compiler/wiki/Warnings
          'accessControls',
          'const',
          'visibility'
        ],
        only_closure_dependencies: null,
        output_wrapper: '(function(){%output%}).call(this);'
      })
    }))
    .pipe(gulp.dest(dest));
});

function addCompilerFlagOptions(opts) {
  // Add any compiler options specified by command line flags.
  if (argv.pretty) {
    opts.formatting = 'PRETTY_PRINT';
  }
  return opts;
}

gulp.task('vulcanize-scenes', ['rm-dist', 'compass', 'compile-scenes'], function() {
  return gulp.src([
      'scenes/*/*-scene*.html'
    ], {base: './'})
    // gulp-vulcanize doesn't currently handle multiple files in multiple
    // directories well right now, so vulcanize them one at a time
    .pipe(foreach(function(stream, file) {
      var dest = path.dirname(path.relative(__dirname, file.path));
      return stream.pipe(vulcanize({
        excludes: {
          // these are inlined in elements.html
          imports: [
            'jquery.html$',
            'modernizr.html$',
            'polymer.html$',
            'base-scene.html$',
            'i18n-msg.html$',
            'core-a11y-keys.html$',
            'core-shared-lib.html$',
            'google-maps-api.html$',
            'google-client-api.html',
            'google-plusone-api.html', // tracker
            'google-youtube-api.html',// tracker
            'google-jsapi.html', // tracker
            'core-selection.html',
            'core-selector.html',
            'core-pages.html',
            'paper-fab.html',
            'paper-item.html'
          ]
        },
        strip: !argv.pretty,
        csp: true,
        inline: true,
        dest: dest
      }))
      .pipe(i18n_replace({
        strict: !!argv.strict,
        path: '_messages',
      }))
      .pipe(gulp.dest(path.join(DIST_STATIC_DIR, dest)));
    }));
});

gulp.task('vulcanize-codelab-frame', ['rm-dist', 'compass', 'compile-scenes'], function() {
  return gulp.src('scenes/codelab/codelab-frame_en.html', {base: './'})
    .pipe(argv.pretty ? gutil.noop() : replace(/window\.DEV ?= ?true.*/, ''))
    .pipe(vulcanize({
      strip: !argv.pretty,
      csp: true,
      inline: true,
      dest: 'scenes/codelab'
    }))
    .pipe(i18n_replace({
      strict: !!argv.strict,
      path: '_messages'
    }))
    .pipe(gulp.dest(DIST_STATIC_DIR + '/scenes/codelab/'));
});

// vulcanize elements separately as we want to inline polymer.html and
// base-scene.html here
gulp.task('vulcanize-elements', ['rm-dist', 'compass', 'compile-santa-api-service'], function() {
  return gulp.src('elements/elements_en.html', {base: './'})
    .pipe(vulcanize({
      strip: !argv.pretty,
      csp: true,
      inline: true,
      dest: 'elements/'
    }))
    .pipe(i18n_replace({
      strict: !!argv.strict,
      path: '_messages',
    }))
    .pipe(gulp.dest(DIST_STATIC_DIR + '/elements/'));
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
    'components/webcomponentsjs/webcomponents.min.js'
  ], {base: './'})
  .pipe(gulp.dest(DIST_STATIC_DIR));

  var prodStream = gulp.src([
    'images/og.png',
    'embed.js'
  ], {base: './'})
  .pipe(gulp.dest(DIST_PROD_DIR));

  return mergeStream(staticStream, prodStream);
});

gulp.task('watch', function() {
  gulp.watch(COMPASS_FILES, ['compass']);
  gulp.watch(CLOSURE_FILES, ['compile-scenes']);
});

gulp.task('default', ['copy-assets']);
