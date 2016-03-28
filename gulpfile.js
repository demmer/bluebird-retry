'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var mocha = require('gulp-mocha');
var mochaPhantom = require('gulp-mocha-phantomjs');
var istanbul = require('gulp-istanbul');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('browserify', function () {
    // set up the browserify instance on a task basis
    var b = browserify(['./lib/bluebird-retry.js'], {
        bundleExternal: false,
        standalone: 'bluebirdRetry',
        debug: true
    });

    return b.bundle()
    .pipe(source('bluebird-retry.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./browser/'));
});

gulp.task('browserify-test', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: 'test/bluebird-retry.spec.js',
        bundleExternal: true,
        debug: true
    });

    return b.bundle()
    .pipe(source('test/bluebird-retry.spec.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./browser'));
});

gulp.task('build', ['browserify', 'browserify-test']);

gulp.task('instrument', function () {
    return gulp.src([
        'lib/*.js'
    ])
    .pipe(istanbul({
        includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

function gulp_test() {
    return gulp.src('test/*.spec.js')
        .pipe(mocha({
            log: true,
            timeout: 10000,
            slow: 3000,
            reporter: 'spec',
            ui: 'bdd',
            ignoreLeaks: true,
            globals: ['should']
        }));
}

gulp.task('test-node', function() {
    return gulp_test();
});

gulp.task('test-phantom', function() {
    return gulp.src('browser/test/index.html')
    .pipe(mochaPhantom({
        reporter: 'spec',
        mocha: {
            colors: true
        }
    }));
});

gulp.task('test-coverage', ['instrument'], function() {
    return gulp_test()
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({
            thresholds: {
                global: {
                    statements: 100,
                    branches: 100,
                    functions: 100,
                    lines: 100
                }
            }
        }));
});

gulp.task('test', ['test-coverage', 'test-phantom']);
