/**
 * Created by lukeluke on 10/29/15.
 */
var gulp = require('gulp');
var cssmin = require("gulp-cssmin");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


/*gulp.task('build-css', function(){
    return gulp.src(['./app/assets/bootstrap/css/bootstrap.css','./app/assets/css/*.css'])
        .pipe(cssmin())
        .pipe(concat('main.min.css'))
        .pipe(gulp.dest('./app/assets/dist/'));
});*/

gulp.task('build-js', function(){
    return gulp.src(['blakearchive/static/js/*/*.js','blakearchive/static/js/*.js','blakearchive/static/controllers/*/*.js','blakearchive/static/directives/*/*.js'])
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('blakearchive/static/dist/'));
});

gulp.task('default',['build-js'], function(){

});