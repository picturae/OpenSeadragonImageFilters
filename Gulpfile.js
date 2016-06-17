'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('vendor-scripts', function() {
    return gulp.src([
        './bower_components/caman/dist/caman.full.js'
    ])
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('openseadragonimagefilter-vendor.js'))
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('jshint', function() {
    return gulp.src([
            './src/*.js'
        ])
        .pipe(plugins.plumber({
            errorHandler: handleError
        }))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});
/*
minify all dependencies and code in 1 js file
 */
gulp.task('uglify', function() {
    return gulp.src([
            './openseadragon-filtering/openseadragon-filtering.js',
            './bower_components/caman/dist/caman.full.js',
            './bower_components/lodash/dist/lodash.js',
            './src/*.js',
        ])
        .pipe(plugins.plumber({
            errorHandler: handleError
        }))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('openseadragonimagefilter.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});



gulp.task('watch', ['jshint','uglify'], function () {
    gulp.watch('./src/*.js', ['jshint','uglify']);
});

gulp.task('serve', plugins.serve({
    root: ['dist', 'images'],
    port: 4040,
}));

gulp.task('default', ['watch', 'serve']);


/**
 * Displays error message in the console
 * @param error
 */
function handleError(error) {
    plugins.util.beep();
    plugins.util.log(plugins.util.colors.red(error));
}
