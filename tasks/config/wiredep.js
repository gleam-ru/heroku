module.exports = function(grunt) {
    // https://github.com/taptapship/wiredep#configuration
    grunt.config.set('wiredep', {
        task: {
            ignorePath: "../../..",
            exclude: [
                '/Sortable',
                'jquery.js',
                'd3.js',
                'techan.js',
            ],
            src: [
                'views/layouts/parts/head.jade',
            ],
            fileTypes: {
                jade: {
                  replace: {
                    js: 'script(src="{{filePath}}" defer)'
                  }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-wiredep');
};
//*/
