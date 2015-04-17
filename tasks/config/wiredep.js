module.exports = function(grunt) {
    // https://github.com/taptapship/wiredep#configuration
    grunt.config.set('wiredep', {
        task: {
            ignorePath: "../../../bower_components/",
            fileTypes: {
                jade: {
                    replace: {
                        js: 'script(src=\'bower/{{filePath}}\')',
                        css: 'link(rel=\'stylesheet\', href=\'bower/{{filePath}}\')'
                    }
                }
            },
            src: [
                'views/layouts/parts/head.jade',
            ]
        }
    });

    grunt.loadNpmTasks('grunt-wiredep');
};
//*/
