module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
        gruntDry: {
            pkg: pkg,
            deps: {
                bluebird: {
                    browserBuild: 'node_modules/bluebird/js/browser/bluebird.js'
                },
                chai: {
                    browserBuild: 'node_modules/chai/chai.js',
                    testOnly: true
                }
            }
        }
    });

    grunt.task.loadNpmTasks('grunt-dry');
};
