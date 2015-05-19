module.exports = function(grunt) {
    // https://github.com/taptapship/wiredep#configuration
    grunt.config.set('wiredep', {
        task: {
            ignorePath: "../../../",
            exclude: ['jquery.js'],
            src: [
                'views/layouts/parts/head.jade',
            ]
        }
    });

    grunt.loadNpmTasks('grunt-wiredep');
};
//*/
