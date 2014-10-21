module.exports = function(grunt) {

  grunt.initConfig({
    // pkg: grunt.file.readJSON('package.json'),

    vulcanize: {
      options: {
        excludes: {
          imports: [
            "polymer.html$",
            "base-scene.html$"
          ]
        },
        strip: true,
        csp: true,
        inline: true
      },
      build: {
        files: {
          'elements/elements.vulcanize.html': 'elements/elements.html',
          'scenes/windtunnel/windtunnel-scene.vulcanize.html': 'scenes/windtunnel/windtunnel-scene.html',
          'scenes/workshop/workshop-scene.vulcanize.html': 'scenes/workshop/workshop-scene.html'
        },
      }
    },

    watch: {
      elements: {
        files: ['components/*.html'],
        tasks: ['vulcanize'],
        options: {
          spawn: false,
        },
      },
    },

    compass: {
      dist: {
        options: {
          sassDir: 'sass',
          cssDir: 'css',
          environment: 'production'
        }
      },
      dev: {
        options: {
          sassDir: 'sass',
          cssDir: 'css',
          watch: true
        }
      }
    },

  });

  // Plugin and grunt tasks.
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['vulcanize:build', 'compass:dist']);
  //grunt.registerTask('serve', ['appengine:run:frontend']);
};