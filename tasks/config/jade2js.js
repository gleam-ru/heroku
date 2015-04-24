module.exports = function(grunt) {
    // https://github.com/taptapship/wiredep#configuration
    grunt.config.set('jade2js', {
        compile: {
            options: {
                namespace: 'Jade'
            },
            files: {
                // TODO: разбить на куски и грузить по мере необходимости,
                // а не подключать глобально в head
                '.tmp/public/js/jade_templates.js': 'views/client/*.jade'
            }
        }
    });

    grunt.loadNpmTasks('grunt-jade-plugin');
};
//*/
