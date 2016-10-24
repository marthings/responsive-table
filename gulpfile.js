// Requires
var gulp = require('gulp'),
    fs = require('fs'),
    glob = require('glob'),
    path = require('path'),
    data = require('gulp-data'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleancss = require('gulp-clean-css'),
    sass = require('gulp-sass'),
    twig = require('gulp-twig'),
    foreach = require('gulp-foreach'),
    browserSync = require('browser-sync');


gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: 'compiled/'
        }
    })
});

gulp.task('bs-reload', function () {
   browserSync.reload();
});

/* SASS */
gulp.task('sass', function(){
  gulp.src(['src/styles/**/*.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sass())
    .pipe(concat('app.min.css'))
    .pipe(cleancss())
    .pipe(gulp.dest('compiled/styles/'))
    .pipe(browserSync.reload({stream:true}))
});


/* Twig Templates */
function getJsonData (file, cb) {
    glob("src/data/*.json", {}, function(err, files) {
        var data = {};
        if (files.length) {
            files.forEach(function(fPath){
                var baseName = path.basename(fPath, '.json');
                data[baseName] = JSON.parse(fs.readFileSync(fPath));
            });
        }
        cb(undefined, data);
    });
}
gulp.task('twig',function(){
    return gulp.src('src/templates/urls/**/*')
        .pipe(plumber({
          errorHandler: function (error) {
            console.log(error.message);
            this.emit('end');
        }}))
        .pipe(data(getJsonData))
        .pipe(foreach(function(stream,file){
            return stream
                .pipe(twig())
        }))
        .pipe(gulp.dest('compiled/'));
});
gulp.task('twig-watch',['twig'],browserSync.reload);


/* Scripts */
gulp.task('scripts', function(){
  return gulp.src(['src/scripts/libs/*.js','src/scripts/*.js'])
    .pipe(plumber({
        errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('compiled/scripts/'));
});
gulp.task('scripts-watch',['scripts'],browserSync.reload);


/* Compile */
gulp.task('compile',['sass','scripts','twig']);

gulp.task('default',['compile','browser-sync'],function(){
    gulp.watch("src/styles/**/*.scss", ['sass']);
    gulp.watch("src/scripts/**/*.js", ['scripts-watch']);
    gulp.watch(['src/templates/**/*','src/data/*.json'],['twig-watch']);
});
