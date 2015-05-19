/**
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * ---------------------------------------------------------------
 *
 * Watch for changes on
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 *      https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function(grunt) {

    grunt.config.set('watch', {

        assets: {
            // Assets to watch:
            files: ['assets/**/*', '!**/node_modules/**'],
            // When assets are changed:
            tasks: ['sync:assets']
        },

        tasks: {
            files: ['tasks/**/*'],
            tasks: ['default']
        },

        jade2js: {
            files: ['views/client/**/*'],
            tasks: ['jade2js']
        },

        usemin: {
            files: ['views/layouts/parts/head.jade'],
            tasks: ['copy:head']
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
};
