"use strict";

var gulp = require('gulp');
var path = require('path');

var spawn = require("gulp-spawn");
var exec = require('child_process').exec,
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    htmlreplace = require('gulp-html-replace'),
    cssmin = require('gulp-cssmin');

var webpack = require('webpack-stream');
require("babel-polyfill");


var webpack_config = {  entry:
    ["babel-polyfill", path.resolve('src/index.js')],
    output: {
        filename: 'bundle.js',
        path: path.resolve('./js')
    },
    module: {
        loaders: [
            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    resolve: {
        extensions: [ '.webpack.js', 'web.js', '.js', '.jsx'],
        // modulesDirectories: ['node_modules', 'bower_components', path.resolve('client/src')]
    }
}


//Scripts to concatenate
const scripts = `
   js/jquery.min.js
   js/bundle.js
`.split('\n').map(x=> x.trim()).filter(x=> x.length > 1);

//Root sass file
const main_scss_file = 'style/main.scss';


gulp.task('webpack', function() {
    return gulp.src('src/index.js')
        .pipe(webpack(webpack_config))
        .pipe(gulp.dest('js/'));
});

gulp.task("concatScripts", function() {
    return gulp.src(scripts)
        .pipe(maps.init())
        .pipe(concat('main.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('js'))
        .pipe(browserSync.stream());
});

gulp.task("minifyScripts", ["concatScripts"], function() {
    return gulp.src("js/main.js")
        .pipe(gulp.dest('dist/js'));
});


gulp.task('compileSass', function() {
    return gulp.src(main_scss_file)
        .pipe(maps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.stream());
});

gulp.task("minifyCss", ["compileSass"], function() {
    return gulp.src("style/main.css")
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css'));
});


gulp.task("runJinja", function(cb) {
    exec('python3.6 templater.py', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('watchFiles', function() {
    gulp.watch('style/**/*.scss', ['compileSass']);
    gulp.watch('css/**/*.css', ['minifyCss']);

    gulp.watch('src/**/*.js', ['webpack']);

    gulp.watch('js/*.js', ['concatScripts']);
    gulp.watch('js/*.js', ['minifyScripts']);

    gulp.watch(['*.html', 'templates/**/*.html'], ['runJinja']);

    gulp.watch(['dist/*/**']).on('change', browserSync.reload);
    gulp.watch(['images/**/*', 'css/**/*', 'js/**/*'], ['copyFiles']);
});


gulp.task("copyFiles", function() {
    return gulp.src([
        'css/**/*',
        "images/**"
    ], { base: './'})
        .pipe(gulp.dest('dist'));
});


gulp.task('serve', ['watchFiles'], function(){
    browserSync.init({
        server: "./dist"
    });
});

gulp.task("default", ['copyFiles', 'serve', 'watchFiles'], function() {


});


