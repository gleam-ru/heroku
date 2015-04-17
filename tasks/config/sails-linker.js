/**
 * Autoinsert script tags (or other filebased tags) in an html file.
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags for javascript files and <link> tags
 * for css files.  Also automatically links an output file containing precompiled
 * templates using a <script> tag.
 *
 * For usage docs see:
 * 		https://github.com/Zolmeister/grunt-sails-linker
 *
 */
module.exports = function(grunt) {

	grunt.config.set('sails-linker', {

        bowerCssIntoHead: {
            options: {
                startTag  : '//- bower:css',
                endTag    : '//- bower:css end',
                fileTmpl  : 'link(rel="stylesheet" href="%s")',
                appRoot   : '.tmp/public'
            },
            files: {
                'views/layouts/parts/head.jade': ['.tmp/public/bower/**/*.css']
            }
        },

		bowerJsIntoHead: {
			options: {
				startTag  : '//- bower:js',
				endTag    : '//- bower:js end',
				fileTmpl  : 'script(src="%s")',
				appRoot   : '.tmp/public'
			},
			files: {
				'views/layouts/parts/head.jade': ['.tmp/public/bower/**/*.js']
			}
		},

	});

	grunt.loadNpmTasks('grunt-sails-linker');
};
