module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'less:dev',
		'copy:dev',
    'copy:theme_dev',
		'imagemin:static',
    'weThemeEmberHandlebars:dev',
    'we_sails_ember_tasks:dev'
	]);
};
