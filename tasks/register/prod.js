module.exports = function (grunt) {
    grunt.registerTask('prod', [
        'clean:tmp',          // remove .tmp/**
        'copy:prod',          // assets, bower, bower_img, bower_fonts
        'wiredep',            // insert bower into head
        'jade2js',            // create jade client templates
        'useminPrepare',      // собираю нужные файлы
            'concat',
            'uglify',
            'cssmin',
            'copy:head',      // создание "динамической" головы
        'usemin',             // переделываю динамическую голову
    ]);
};
