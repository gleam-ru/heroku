module.exports = function (grunt) {
    grunt.registerTask('build', [
        // 'clean:dev',    // remove .tmp
        'copy:dev',     // assets + bower
        'wiredep',      // bower into head
        'jade2js',      // create jade client templates
        'copy:head',    // особенности минификатора
        'sync:assets',  // синхронизирую исходники
    ]);
};
