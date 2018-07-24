'use strict';
let gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload, //browserSync
    html2bl = require('html2bl'),
    path = require('path'), //html2bl
    fs = require("fs"),
    urlAdjust = require('gulp-css-url-adjuster'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    del = require('del'),
    sass = require('gulp-sass');

let params = { //html2bl and others
        out: 'dist',
        htmlSrc: 'app/pages.html/index.html',
        levels: ['app/blocks/library.blocks', 'app/blocks/common.blocks'],
        extCssFiles: 'scss',
        sassDir: "app/sass",
        fontelloDir: "app/libs/fontello",
        imgDir: "images"
    },
    getFileNames = html2bl.getFileNames(params);//html2bl

gulp.task('default', ['server', 'build']);

gulp.task('server', function () {
    browserSync.init({
        server: params.out
    })
});

gulp.task ('build', ['html', 'sass', 'js', 'images', 'fontello']);

gulp.task('html', function () {
    gulp.src(params.htmlSrc)
        .pipe(rename('index.html'))
        .pipe(gulp.dest(params.out))
        .pipe(reload({stream: true}));
});


// gulp.task('sass', function () {
//     getFileNames.then(function (files) {//html2bl
//         gulp.src(files.dirs.map(dir => dir + '/**/*.scss'))
//             .pipe(concat('styles.scss'))
//             .pipe(sass().on('error', sass.logError))
//             .pipe(rename('styles.css'))
//             .pipe(gulp.dest(params.out))
//             //.pipe(autoprefixer({browsers: ['last 2 versions']}))
//             .pipe(urlAdjust({prepend: './images/'}))
//             .pipe(reload({stream: true}));
//     })
//         .done();
// });

gulp.task('sass', function() {
    getFileNames.then(function(files) {

        let strModules = '';
        files.scss.forEach(function (absPath) {
            strModules += '@import "' + path.relative(params.sassDir, absPath).replace(/\\/g, '/') + '";\n';
        });

        console.log('strModules', strModules);
        console.log('files', files);

        fs.writeFileSync(params.sassDir + "/_modules.scss", strModules);

        gulp.src(params.sassDir + '/main.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(rename('styles.css'))
            //.pipe(autoprefixer({browsers: ['last 2 versions']}))
            .pipe(urlAdjust({prepend: './' + params.imgDir + '/'}))
            .pipe(gulp.dest(params.out))
            .pipe(reload({stream: true}));
    })
        .done();
});


gulp.task('js', function () {
    getFileNames.then(function (source) {
        //console.log('JS dirs', source.dirs);
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
            .pipe(gulp.dest(path.join(params.out + '/' + params.imgDir)));
    })
        .done();
});

gulp.task('fontello', function() {
    return gulp.src([params.fontelloDir + '/css/animation.css', params.fontelloDir + '/css/fontello.css'])
        .pipe(concat('fontello.css'))
        .pipe(gulp.dest(params.out))
        //.pipe(rename({suffix: '.min'}))
        //.pipe(csso())
        .pipe(gulp.dest(params.out));
        //.pipe(notify({ message: 'Fontello styles task complete' }));
});


gulp.watch(params.htmlSrc, ['html']);
gulp.watch(params.levels.map( level => level + '/**/*.scss' ), ['sass']);

