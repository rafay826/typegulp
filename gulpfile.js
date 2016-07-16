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
        bundleJS,
        copyDist,
        typeBrowserRef
        appRoot;

    //Instantiate Variables
        // Build CSS
    var buildCss = 'src/sass/*.scss', 
        partialCss = 'src/sass/partials/*',
        // Finished Concat + Minify CS, 
        finCss = 'style.min.css',
        // Distribute CS, 
        distCss = 'app/css',

        // Build J, 
        buildJs = 'src/js/*.js',
        // Finished Concat + Minify J, 
        finJs = 'final.js', 
            minJs = 'final.min.js',
        // Distribute J, 
        distMinJs = 'app/js/final.min.js', 
        distJs = 'app/js', 
        controllerJs = 'controller/*.js',

        // main typescript locatio, 
        mainTS = 'src/*.ts',
        // bundle.js nam, 
        bundleJS = 'bundle.js',

        // Angular 2 shims locatio, 
        copyDist = 'app/lib',

        // Application Roo, 
        appRoot = "app",
        typeBrowserRef = "node_modules/angular2/typings/browser.d.ts",

        // Include Our Plugin, 
        gulp = require("gulp"), 
        browserify = require("browserify"), 
        source = require('vinyl-source-stream'), 
        sourcemaps = require('gulp-sourcemaps'),
        typescript = require('gulp-typescript'),
        tscConfig = require('./tsconfig.json'),
        buffer = require('vinyl-buffer'), 
        watchify = require("watchify"), 
        uglify = require("gulp-uglify"), 
        tsify = require("tsify"), 
        gutil = require("gulp-util"), 
        stream = require("gulp-streamify"),
        jshint = require('gulp-jshint'), 
        sass = require('gulp-sass'), 
        concat = require('gulp-concat'), 
        uglify = require('gulp-uglify'), 
        rename = require('gulp-rename'), 
        prefix = require('gulp-autoprefixer'), 
        server = require('gulp-server-livereload'),
        paths = {
            pages: ['src/*.html']
        };

    // Load web-server at localhost:8000
    gulp.task('webserver', function() {
      gulp.src('./')
        .pipe(server({
          livereload: true,
          directoryListing: true,
          open: true
        }));
    });
    
    // Copy Angular 2 shims to dist/lib
    gulp.task('copylibs', function() {
      return gulp
        .src([
          'node_modules/es6-shim/es6-shim.min.js',
          'node_modules/systemjs/dist/system-polyfills.js',
          'node_modules/angular2/bundles/angular2-polyfills.js',
          'node_modules/systemjs/dist/system.src.js',
          'node_modules/rxjs/bundles/Rx.js',
          'node_modules/angular2/bundles/angular2.dev.js'
        ])
        .pipe(gulp.dest(copyDist));
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
            .pipe(gulp.dest(appRoot));
    }
    
    gulp.task('typescript', function () {
      return gulp
        .src([mainTS, typeBrowserRef])
        .pipe(sourcemaps.init())
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(distJs));
    });
    
    // Watch Files For Changes
    gulp.task('watch', function() {
        gulp.watch([buildJs, controllerJs, distMinJs], ['lint', 'scripts']);
        gulp.watch([buildCss, partialCss], ['sass']);
        gulp.watch(mainTS, ['typescript']);
    });

    gulp.task("default", ['lint', 'sass', 'webserver', 'copylibs', 'typescript', 'watch']);
//    watchedBrowserify.on("update", bundle);
//    watchedBrowserify.on("log", gutil.log);
}());