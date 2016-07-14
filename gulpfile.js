(function (){
    'use strict';
    var buildCss,
        partialCss,
        finCss,
        distCss,
        buildJs,
        finJs,
        minJs,
        distMinJs,
        distJs,
        controllerJs,
        gulp,
        jshint,
        sass,
        concat,
        uglify,
        rename,
        prefix,
        server,
        browserify,
        source,
        sourcemaps,
        buffer,
        watchify,
        tsify,
        gutil,
        stream,
        mainTS,
        bundleJS;

    var gulp = require("gulp");
    var browserify = require("browserify");
    var source = require('vinyl-source-stream');
    var sourcemaps = require('gulp-sourcemaps');
    var buffer = require('vinyl-buffer');
    var watchify = require("watchify");
    var uglify = require("gulp-uglify");
    var tsify = require("tsify");
    var gutil = require("gulp-util");
    var stream = require("gulp-streamify");

    //Build CSS
    var buildCss = 'src/sass/*.scss';
    var partialCss = 'src/sass/partials/*';
    // Finished Concat + Minify CSS
    var finCss = 'style.min.css';
    // Distribute CSS
    var distCss = 'dist/css';

    // Build JS
    var buildJs = 'src/js/*.js';
    // Finished Concat + Minify JS
    var finJs = 'final.js';
    var minJs = 'final.min.js';
    // Distribute JS
    var distMinJs = 'dist/js/final.min.js';
    var distJs = 'dist/js';
    var controllerJs = 'controller/*.js';
    
    // main typescript location
    var mainTS = 'src/main.ts';
    // bundle.js name
    var bundleJS = 'bundle.js';

    // Include Our Plugins
    var gulp = require('gulp');
    var jshint = require('gulp-jshint');
    var sass = require('gulp-sass');
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');
    var rename = require('gulp-rename');
    var prefix = require('gulp-autoprefixer');
    var server = require('gulp-server-livereload');

    // Load web-server at localhost:8000
    gulp.task('webserver', function() {
      gulp.src('./')
        .pipe(server({
          livereload: true,
          directoryListing: true,
          open: true
        }));
    });

    // Lint Task
    gulp.task('lint', function() {
        return gulp.src([buildJs, controllerJs])
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    // Compile Our Sass
    gulp.task('sass', function() {
        return gulp.src([buildCss, partialCss])
            .pipe(sass({outputStyle: 'compressed'})).on('error', sass.logError)
            .pipe(concat(finCss))
            .pipe(prefix({
      browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
    }))
            .pipe(gulp.dest(distCss));
    });

    // Concatenate & Minify JS
    gulp.task('scripts', function() {
        return gulp.src(buildJs)
            .pipe(concat(finJs))
            .pipe(gulp.dest(distJs))
            .pipe(rename(minJs))
            .pipe(uglify())
            .pipe(gulp.dest(distJs));
    });

    // Watch Files For Changes
    gulp.task('watch', function() {
        gulp.watch([buildJs, controllerJs, distMinJs], ['lint', 'scripts']);
        gulp.watch([buildCss, partialCss], ['sass']);
    });
    var paths = {
        pages: ['src/*.html']
    };

    var watchedBrowserify = watchify(browserify({
        basedir: '.',
        debug: true,
        entries: [mainTS],
        cache: {},
        packageCache: {}
    }).plugin(tsify));

    function bundle() {
        return watchedBrowserify
            .transform("babelify")
            .bundle()
            .pipe(source(bundleJS))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
    // Gulp Uglify is producing errors at the sourcemap level
    //        .pipe(stream(uglify()).on('error', gutil.log))
            .pipe(gulp.dest("dist"));
    }

    gulp.task("default", ['lint', 'sass', 'webserver', 'watch'], bundle);
    watchedBrowserify.on("update", bundle);
    watchedBrowserify.on("log", gutil.log);
}());