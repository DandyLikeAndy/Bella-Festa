'use strict';
let gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload, //browserSync
    html2bl = require('html2bl'),
    path = require('path'), //html2bl
    urlAdjust = require('gulp-css-url-adjuster'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    del = require('del'),
    sass = require('gulp-sass');

let params = { //html2bl and others
    out: 'dist',
    htmlSrc: 'app/index.html',
    levels: ['app/library.blocks', 'app/common.blocks']
},
    getFileNames = html2bl.getFileNames(params);//html2bl

gulp.task('default', ['server', 'build']);

gulp.task('server', function () {
    browserSync.init({
        server: params.out
    })
});

gulp.task ('build', ['html', 'sass', 'js', 'images', 'fontStyle']);

gulp.task('html', function () {
    gulp.src(params.htmlSrc)
        .pipe(rename('index.html'))
        .pipe(gulp.dest(params.out))
        .pipe(reload({stream: true}));
});


gulp.task('sass', function () {
    getFileNames.then(function (files) {//html2bl
        console.log('sass dirs', files.dirs );
        gulp.src(files.dirs.map(dir => dir + '/**/*.scss'))
            .pipe(concat('styles.scss'))
            .pipe(sass().on('error', sass.logError))
            .pipe(rename('styles.css'))
            .pipe(gulp.dest(params.out))
            //.pipe(autoprefixer({browsers: ['last 2 versions']}))
            .pipe(urlAdjust({prepend: './images/'}))
            .pipe(reload({stream: true}));
    })
        .done();
});

/*gulp.task('sass', function () {
    getFileNames.then(function (files) {//html2bl
        console.log('sass dirs', files.dirs );
        gulp.src(files.dirs.map(dir => dir + '*.scss'))
            .pipe(concat('styles.scss'))
            .pipe(sass().on('error', sass.logError))
            .pipe(rename('styles.css'))
            .pipe(gulp.dest(params.out))
            //.pipe(autoprefixer({browsers: ['last 2 versions']}))
            .pipe(urlAdjust({prepend: './images/'}))
            .pipe(reload({stream: true}));
    })
        .done();
});*/

gulp.task('js', function () {
    getFileNames.then(function (source) {
        console.log('JS dirs', source.dirs);
        gulp.src(source.dirs.map(dir => dir + '/**/*.js'))
            .pipe(concat('app.js'))
            .pipe(gulp.dest(params.out))
            .pipe(reload({stream: true})); //browserSync
    })
        .done();
});

gulp.task('images', function () {
    getFileNames.then(function(source) {
        gulp.src(source.dirs.map(dir => dir + '/*.{jpg,png,svg}'))
            .pipe(gulp.dest(path.join(params.out + '/images/')));
    })
        .done();
});

gulp.task('fontStyle', function() {
    return gulp.src(['app/libs/fontello/css/animation.css', 'app/libs/fontello/css/fontello.css'])
        .pipe(concat('fontello.css'))
        .pipe(gulp.dest(params.out))
        //.pipe(rename({suffix: '.min'}))
        //.pipe(csso())
        .pipe(gulp.dest('assets/fontello/css'))
        .pipe(notify({ message: 'Fontello styles task complete' }));
});

gulp.watch('app/*.html', ['html']);
gulp.watch(params.levels.map( level => level + '/**/*.scss' ), ['sass']);

