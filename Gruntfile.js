module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
               sourceMap: true
           },
           my_target: {
              files: {
                'blakearchive/static/js/minified/output.min.js': [
                    "blakearchive/static/js/main.js",
                    "blakearchive/static/js/scripts.js",
                    "blakearchive/static/directives/objects-for-copy/directive.js",
                    "blakearchive/static/directives/copies-for-work/directive.js",
                    "blakearchive/static/directives/view-sub-menu/directive.js",
                    "blakearchive/static/directives/menu/directive.js",
                    "blakearchive/static/directives/copy-information/directive.js",
                    "blakearchive/static/directives/object-viewer/directive.js",
                    "blakearchive/static/directives/objects-from-same-matrix/directive.js",
                    "blakearchive/static/directives/objects-from-same-production-sequence/directive.js",
                    "blakearchive/static/directives/objects-with-same-motif/directive.js",
                    "blakearchive/static/directives/object-compare/directive.js"
                ]
              }
           }
        },

     /* Removes too much CSS so slide out details panel breaks
       purifycss: {
            options: {rejected: true},
            target: {
              src: [
                  'blakearchive/static/html/*.html',
                  "blakearchive/static/directives/objects-for-copy/template.html",
                  "blakearchive/static/directives/copies-for-work/template.html",
                  "blakearchive/static/directives/view-sub-menu/template.html",
                  "blakearchive/static/directives/menu/template.html",
                  "blakearchive/static/directives/copy-information/template.html",
                  "blakearchive/static/directives/object-viewer/template.html",
                  "blakearchive/static/directives/objects-from-same-matrix/template.html",
                  "blakearchive/static/directives/objects-from-same-production-sequence/template.html",
                  "blakearchive/static/directives/objects-with-same-motif/template.html",
                  "blakearchive/static/directives/object-compare/template.html"
              ],
              css: ["blakearchive/static/css/styles.css"],
              dest:'blakearchive/static/css/purestyles.css'
            }
        }, */

        cssmin: {
            combine: {
                files: {
                  'blakearchive/static/css/output.min.css': ["blakearchive/static/css/styles.css", "blakearchive/static/css/main.css"]
                // 'blakearchive/static/css/output.min.css': ["blakearchive/static/css/purestyles.css"]
                }
            }
        }
    });

    // Load the plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
 //   grunt.loadNpmTasks('grunt-purifycss');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'cssmin']);
//    grunt.registerTask('purify', ['purifycss']);
};