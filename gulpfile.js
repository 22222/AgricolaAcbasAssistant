'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    del = require('del'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache');

gulp.task('copy-bower-js', function() {
  return gulp.src([
        'bower_components/underscore/underscore-min.js',
        'bower_components/deferred-js/js/deferred.min.js',
        'bower_components/knockout/dist/knockout.js'
        //'bower_components/jquery/dist/jquery.min.js',
        //'bower_components/bootstrap/dist/js/bootstrap.min.js'
    ])
    .pipe(gulp.dest('dist/js'))
});
gulp.task('copy-bower-css', function() {
  return gulp.src([
        'bower_components/bootstrap/dist/css/bootstrap.min.css',
        'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
        'bower_components/fontawesome/css/font-awesome.min.css'
    ])
    .pipe(gulp.dest('dist/css'))
});
gulp.task('copy-bower-fonts', function() {
  return gulp.src([
        'bower_components/fontawesome/fonts/*.*'
    ])
    .pipe(gulp.dest('dist/fonts'))
});
gulp.task('copy-bower', function() {
    gulp.start('copy-bower-js', 'copy-bower-css', 'copy-bower-fonts');
});

gulp.task('copy-phonegap', function() {
  gulp.src(['phonegap/config.xml'])
    .pipe(gulp.dest('dist'));
  gulp.src(['phonegap/res/icon/*.png'])
    .pipe(gulp.dest('dist/res/icon'));
});

gulp.task('copy', function() {
    gulp.start('copy-bower');
});

gulp.task('build-html', function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist'))
});
gulp.task('build-scripts', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(concat('site.js'))
    //.pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});
gulp.task('build-styles', function() {
  return gulp.src('src/css/**/*.css')
    .pipe(concat('site.css'))
    .pipe(autoprefixer('last 2 version'))
    //.pipe(gulp.dest('dist/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'))
});
gulp.task('build-images', function() {
  return gulp.src('src/images/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/images'));
});
gulp.task('build', function() {
    gulp.start('build-html', 'build-scripts', 'build-styles', 'build-images');
});

gulp.task('clean', function(cb) {
    del(['dist'], cb)
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.html', ['build-html']);
  gulp.watch('src/**/*.js', ['build-scripts']);
  gulp.watch('src/**/*.css', ['build-styles']);
});

gulp.task('default', ['clean'], function() {
    gulp.start('copy', 'build');
});