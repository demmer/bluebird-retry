module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
        pkg: pkg
    });

    grunt.task.loadNpmTasks('grunt-dry');
};
