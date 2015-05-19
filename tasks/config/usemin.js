module.exports = function(grunt) {

    grunt.config.set('useminPrepare', {
        jade: 'views/layouts/parts/head.jade',
        options: {
            root    : '.tmp/public/', // откуда смотрим
            staging : '.tmp/public/', // куда кладем "промежуточные" файлы (конкат)
            dest    : '.tmp/public/', // куда кладем финальные файлы (описаны в голове)
        },
    });

    grunt.config.set('usemin', {
        head: ['views/layouts/parts/_head.jade']
    });

    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
};
