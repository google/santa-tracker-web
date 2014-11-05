/* jshint node: true */

var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');
var compass = require('gulp-compass');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var foreach = require('gulp-foreach');
var del = require('del');
var wrap = require('gulp-wrap');

var COMPASS_FILES = '{scenes,sass,elements}/**/*.scss';

gulp.task('clean', function(cleanCallback) {
  del(['dist'], cleanCallback);
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

gulp.task('vulcanize-scenes', ['clean', 'compass'], function() {
  return gulp.src([
      'scenes/*/*-scene.html'
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
            'base-scene.html$'
          ]
        },
        strip: true,
        csp: true,
        inline: true,
        dest: dest
      }))
      .pipe(gulp.dest(path.join('dist', dest)));
    }));
});

// vulcanize elements separately as we want to inline polymer.html and
// base-scene.html here
gulp.task('vulcanize-elements', ['clean', 'compass'], function() {
  return gulp.src('elements/elements.html', {base: './'})
    .pipe(vulcanize({
      strip: true,
      csp: true,
      inline: true,
      dest: 'elements/'
    }))
    .pipe(gulp.dest('dist/elements/'));
});

gulp.task('vulcanize', ['vulcanize-scenes', 'vulcanize-elements']);

// copy needed assets (images, sounds, polymer elements, etc) to dist directory
gulp.task('copy-assets', ['clean', 'vulcanize'], function() {
  return gulp.src([
    'index.html',
    'audio/*',
    'images/*.{png,svg,gif}',
    'js/**',
    'sass/*',
    'scenes/base-scene.html',
    'scenes/**/img/*.{png,svg,gif}',
    'components/platform/*',
    'components/polymer/*',
    'components/webcomponentsjs/webcomponents.min.js'
  ], {base: './'})
  .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(COMPASS_FILES, ['compass']);
});

gulp.task('wrap', ['copy-assets'], function() {
  return gulp.src([
    'dist/scenes/*/*-scene.{html,js}',
    'dist/elements/elements.{html,js}',
    'dist/index.html'
  ], {base: './'})
  .pipe(wrap('{% set_tidy "off" %}{% raw %}<%= contents %>{% endraw %}'))
  .pipe(gulp.dest('.'));
});

gulp.task('default', ['copy-assets']);
