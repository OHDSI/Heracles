module.exports = function(grunt) {


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/js/*.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        // run watch to keep minified version update, e.g. 'grunt watch'
        watch: {
            scripts: {
                files: 'src/js/*.js',
                tasks: ['uglify', 'cssmin'],
                options: {
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
            },
            uses_defaults: ['src/js/*.js']
        },
        cssmin: {
            target: {
                files: {
                    'build/<%= pkg.name %>.min.css' : ['src/css/*.css']
                }
            }
        },
        bower: {
            install: {
                //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
            }
        },
        initwebapi : {
        }
    });


    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask("initwebapi", "Initializes the web api configuration", function() {
        grunt.log.writeln('The webapi property is: ' + grunt.config('pkg.web_api_url') + '. Set this in your package.json before running this task.');
        var out = 'build/' + grunt.config('pkg.name') + '.config.js';

        var contents = "function getWebApiUrl() { " +
            "return '" + grunt.config('pkg.web_api_url')  + "';" +
            " }";

        grunt.file.write( out, contents );
    });


    // Default task(s).
    grunt.registerTask('default', ['bower:install', 'jshint', 'uglify', 'cssmin']);


};