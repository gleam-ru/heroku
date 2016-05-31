module.exports = function(grunt) {
    // https://github.com/taptapship/wiredep#configuration
    grunt.config.set('wiredep', {
        task: {
            ignorePath: "../../..",
            exclude: [
                'vue-router.js',
                'dataTables.colReorder.js',
                '/Sortable',
                'jquery.js',
                'd3.js',
                'techan.js',
                'system.js',
            ],
            src: [
                'views/layouts/parts/head.jade',
            ],
            fileTypes: {
                jade: {
                  replace: {
                    js: 'script(src="{{filePath}}")'
                  }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-wiredep');
};
//*/
