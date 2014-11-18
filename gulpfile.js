/* jshint node: true */

var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');
var compass = require('gulp-compass');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var foreach = require('gulp-foreach');
var del = require('del');
var i18n_replace = require('./gulp_scripts/i18n_replace');
var closureCompiler = require('gulp-closure-compiler');

var COMPILER_PATH = 'components/closure-compiler/compiler.jar';
var COMPASS_FILES = '{scenes,sass,elements}/**/*.scss';

gulp.task('clean', function(cleanCallback) {
  del(['dist', 'dist_i18n'], cleanCallback);
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

gulp.task('compile-scenes', function() {
  // TODO(bckenny): for now, whitelist scenes for compilation. switch to
  // blacklist when we're ready.

  var sceneName = 'airport';
  return gulp.src([
    'scenes/' + sceneName + '/js/*.js',
    // 'third_party/lib/TweenMax.js',
    'third_party/externs/greensock/*.js',
    'third_party/externs/jquery/*.js',
    'third_party/lib/base.js'
  ], {base: './'})
    .pipe(closureCompiler({
      compilerPath: COMPILER_PATH,
      fileName: sceneName + '-scene.min.js',
      closure_entry_point: 'app.Belt',
      compilerFlags: {
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        // warning_level: 'VERBOSE',
        jscomp_off: 'checkRegExp', // TODO(bckenny)
        language_in: 'ECMASCRIPT5_STRICT',
        process_closure_primitives: null,
        generate_exports: null,
        // manage_closure_dependencies: null,
        jscomp_warning: [
          // https://github.com/google/closure-compiler/wiki/Warnings
          'accessControls',
          'const',
          'visibility'
        ],
        output_wrapper:
            'var scenes = scenes || {};\n' +
            'scenes.' + sceneName + ' = scenes.' + sceneName + ' || {};\n' +
            '(function(){%output%}).call({ app: scenes.' + sceneName + ' });'
      }
    }))
    .pipe(gulp.dest('scenes/' + sceneName));
});

gulp.task('vulcanize-scenes', ['clean', 'compass'], function() {
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
            'polymer.html$',
            'base-scene.html$',
            'i18n-msg.html$'
          ]
        },
        strip: true,
        csp: true,
        inline: true,
        dest: dest
      }))
      .pipe(i18n_replace({
        path: '_messages'
      }))
      .pipe(gulp.dest(path.join('dist', dest)));
    }));
});

// vulcanize elements separately as we want to inline polymer.html and
// base-scene.html here
gulp.task('vulcanize-elements', ['clean', 'compass'], function() {
  return gulp.src('elements/elements_en.html', {base: './'})
    .pipe(vulcanize({
      strip: true,
      csp: true,
      inline: true,
      dest: 'elements/'
    }))
    .pipe(i18n_replace({
      path: '_messages'
    }))
    .pipe(gulp.dest('dist/elements/'));
});

gulp.task('vulcanize', ['vulcanize-scenes', 'vulcanize-elements']);

// copy needed assets (images, sounds, polymer elements, etc) to dist directory
gulp.task('copy-assets', ['clean', 'vulcanize'], function() {
  return gulp.src([
    'index.html',
    'schedule.html',
    'manifest.json',
    'audio/*',
    'images/*.{png,svg,gif,ico}',
    'js/**',
    'sass/*.css',
    'scenes/**/img/**/*.{png,svg,gif}',
    'elements/**/img/*.{png,svg,gif}',
    'components/platform/*',
    'components/polymer/*',
    'components/webcomponentsjs/webcomponents.min.js'
  ], {base: './'})
  .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(COMPASS_FILES, ['compass']);
});

gulp.task('default', ['copy-assets']);
