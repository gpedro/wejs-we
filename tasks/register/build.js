module.exports = function (grunt) {
	grunt.registerTask('build', [
    'compileAssetsProd',
    'copy:dev',
    'concat:js',
    'concat:css',
    'cssmin',
    'uglify',
    //'compileAssets',
	'clean:build',
	'copy:build'
	]);
};
