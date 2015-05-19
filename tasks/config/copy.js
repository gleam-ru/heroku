/**
 * Copy files and folders.
 *
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Copies all directories and files, exept coffescript and less fiels, from the sails
 * assets folder into the .tmp/public directory.
 *
 * # build task config
 * Copies all directories nd files from the .tmp/public directory into a www directory.
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-copy
 */
module.exports = function(grunt) {

    grunt.config.set('copy', {
        head: { // особенности работы с мин-конкат-...
            src:  './views/layouts/parts/head.jade',
            dest: './views/layouts/parts/_head.jade',
        },

        dev: {
            files: [
                { // assets
                    expand: true,
                    cwd: './assets',
                    src: ['**/*.!(coffee|less)'],
                    dest: '.tmp/public',
                },
                { // bower
                    expand: true,
                    cwd: './bower_components',
                    src: ['**/*'],
                    dest: '.tmp/public/bower_components',
                },
            ]
        },

        prod: {
            files: [
                { // assets
                    expand: true,
                    cwd: './assets',
                    src: ['**/*.!(coffee|less)'],
                    dest: '.tmp/public',
                },
                { // bower
                    expand: true,
                    cwd: './bower_components',
                    src: ['**/*'],
                    dest: '.tmp/public/bower_components',
                },
                { // бовер картинки (цена минификации - потеря путей)
                    expand: true,
                    flatten: true,
                    cwd: './bower_components',
                    src: ['**/images/*'],
                    dest: '.tmp/public/images/',
                },
                { // бовер шрифты (цена минификации - потеря путей)
                    expand: true,
                    flatten: true,
                    cwd: './bower_components',
                    src: ['**/fonts/**/*'],
                    dest: '.tmp/public/fonts/',
                },
            ]
        },
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
};
