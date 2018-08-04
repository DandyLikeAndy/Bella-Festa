'use strict';
const gulp = require('gulp'),
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
        sassDir: 'app/sass',
        jsDir: 'app/js',
        fontelloDir: 'app/libs/fontello',
        fontsDir: 'app/libs/fonts',
        outImgDir: 'images'
    },
    getFileNames = html2bl.getFileNames(params); //html2bl

gulp.task('default', ['server', 'build']);

gulp.task('server', function () {
    browserSync.init({
        server: params.out
    })
});

gulp.task('build', ['clean', 'html', 'sass', 'js', 'images', 'fonts', 'fontello']);



gulp.task('html', function () {
    return gulp.src(params.htmlSrc)
        .pipe(rename('index.html'))
        .pipe(gulp.dest(params.out))
        .pipe(reload({
            stream: true
        }));
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

gulp.task('sass', function () {
    return getFileNames.then(function (files) {
            let strModules = '';
            files.scss.forEach(function (absPath) { //collect @imports bem blocks
                strModules += '@import "' + path.relative(params.sassDir, absPath).replace(/\\/g, '/') + '";\n';
            });

            console.log('files', files);
            //write to file _modules.scss imports of bem blocks
            fs.writeFileSync(params.sassDir + "/_modules.scss", strModules);

            gulp.src(params.sassDir + '/main.scss')
                .pipe(sass().on('error', sass.logError))
                .pipe(rename('styles.css'))
                //.pipe(autoprefixer({browsers: ['last 2 versions']}))
                .pipe(urlAdjust({
                    //prependRelative for image (images must be in the block folder)
                    prependRelative: './' + params.outImgDir + '/'
                }))
                .pipe(gulp.dest(params.out))
                .pipe(reload({
                    stream: true
                }));
        })
        //make the script works only once at the loading, https://github.com/cujojs/when/blob/HEAD/docs/api.md#promisedone
        .done();
});


gulp.task('js', function () {
    return getFileNames.then(function (source) {
            gulp.src( [params.jsDir + '/**/*.js'].concat(source.dirs.map(dir => dir + '/**/*.js')) )
                .pipe(concat('app.js'))
                .pipe(gulp.dest(params.out))
                .pipe(reload({
                    stream: true
                })); //browserSync
        })
        .done();
});

gulp.task('images', function () {
    return getFileNames.then(function (source) {
            gulp.src(source.dirs.map(dir => dir + '/*.{jpg,png,svg}'))
                .pipe(gulp.dest(path.join(params.out + '/' + params.outImgDir)));
        })
        .done();
});

gulp.task('fonts', function () {
    return gulp.src([params.fontsDir + '/*.*', '!' + params.fontsDir + '/*.txt'])
        .pipe(gulp.dest(params.out + '/fonts'))
});

gulp.task('fontello', function () {
    return gulp.src([params.fontelloDir + '/css/animation.css', params.fontelloDir + '/css/fontello.css'])
        .pipe(concat('fontello.css'))
        .pipe(gulp.dest(params.out))
        //.pipe(rename({suffix: '.min'}))
        //.pipe(csso())g
        .pipe(gulp.dest(params.out));
        //.pipe(notify({ message: 'Fontello styles task complete' }));
});

gulp.task('clean', function () {
    return del.sync(params.out); // Удаляем папку dist перед сборкой
});

gulp.watch(params.htmlSrc, ['html']);
gulp.watch((params.levels.map(level => level + '/**/*.scss').concat(params.sassDir + '/**/*.scss')), ['sass']);
gulp.watch((params.levels.map(level => level + '/**/*.js').concat(params.jsDir + '/**/*.js')), ['js']);