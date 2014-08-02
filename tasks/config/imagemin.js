/**
 * @We: task
 *
 * @Name: imagemin
 * @Description: Minify images
 * @Reference: https://github.com/gruntjs/grunt-contrib-imagemin
 *
 */

var themeEngine = require('we-theme-engine');

module.exports = function(grunt) {
  grunt.config.set('imagemin', {
    static: {
      options: {
        optimizationLevel: 3
      },
      files: [{
        expand: true,
        cwd: themeEngine.getassetsCwdFolder() + '/assets/img/',
        src: ['**/*.{png,jpg,gif}'],
        dest: '.tmp/theme/assets/img/'
      }]
    }
  });
  grunt.loadNpmTasks('grunt-contrib-imagemin');
};
