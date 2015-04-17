module.exports = function (grunt) {
	grunt.registerTask('build', [
		// 'clean:dev', // remove .tmp
        // 'copy:dev', // assets + bower
        'sync:dev', // assets + bower
        'wiredep', // bower into head
	]);
};
