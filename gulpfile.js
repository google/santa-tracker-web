/* jshint node: true */

var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');
var compass = require('gulp-compass');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var foreach = require('gulp-foreach');

var COMPASS_FILES = '{scenes,sass,elements}/**/*.scss';

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

gulp.task('vulcanize', ['compass'], function () {
  return gulp.src([
      'elements/elements.html',
      'scenes/*/*-scene.html'
    ])
    .pipe(foreach(function(stream, file) {
      var dest = path.join('dist',
          path.dirname(path.relative(__dirname, file.path)));
      return stream.pipe(vulcanize({
        excludes: {
          imports: [
            'polymer.html$',
            'base-scene.html$'
          ]
        },
        strip: true,
        csp: true,
        inline: true,
        dest: dest
      }));
    }));
});

// copy needed assets (images, sounds, polymer elements, etc) to dist directory
gulp.task('copy-assets', ['vulcanize'], function() {
  return gulp.src([
    '!dist/**',
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

gulp.task('default', ['vulcanize', 'copy-assets']);
