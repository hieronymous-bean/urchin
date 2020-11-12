// Import Required Packages //
// ------------------------------
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-dart-sass');
const pug = require('gulp-pug');
const del = require('del');
const concat = require('gulp-concat');
var header = require('gulp-header');
const merge = require('merge-stream');
const cleanCSS = require('gulp-clean-css');
const { series } = require('gulp');
const vinyl = require('vinyl');
const config = require("./config.json")



// Constants //
// ------------------------------

/* Directories */
const dirs = {
    app: 'src/',
    assets: 'assets/',
    dist: 'dist/'
};

/* Paths */
const paths = {
    app: {
        assets: dirs.app + dirs.assets,
        scss: dirs.app + dirs.assets + 'scss/',
        css: dirs.app + dirs.assets + 'css/',
        js: dirs.app + dirs.assets + 'js/',
        vendors: dirs.app + dirs.assets + 'vendors/',
        fonts: dirs.app + dirs.assets + 'fonts/',
        images: dirs.app + dirs.assets + 'images/'
    },
    dist: {
        assets: dirs.dist + dirs.assets,
        css: dirs.dist + dirs.assets + 'css/',
        js: dirs.dist + dirs.assets + 'js/',
        fonts: dirs.dist + dirs.assets + 'fonts/',
        images: dirs.dist + dirs.assets + 'images/'
    }
}

/* Stamp Branding */
const app = require('./package.json');
const banner = [
    '/*!',
    ` * ${app.name} - v${app.version}`,
    ` * @author ${app.author} - ${app.repository.url} `,
    ` * Copyright (c) ${new Date().getFullYear()}`,
    ' */',
    ''].join('\n');




// Intial Setup & Vendor Tasks //
// ------------------------------

gulp.task('cleanBuild', () => {
    return del([paths.app.css, paths.app.js, paths.app.vendors, paths.dist.assets]);
});
gulp.task('cloneVendorSCSS', () => {
    var style1 = gulp.src('./node_modules/bootstrap/scss/*.scss').pipe(gulp.dest('./src/assets/vendors/bootstrap/scss'));
    var style2 = gulp.src('./node_modules/bootstrap/scss/mixins/*.scss').pipe(gulp.dest('./src/assets/vendors/bootstrap/scss/mixins'));
    var style3 = gulp.src('./node_modules/bootstrap/scss/utilities/*.scss').pipe(gulp.dest('./src/assets/vendors/bootstrap/scss/utilities'));
    var style4 = gulp.src('./node_modules/bootstrap/scss/vendor/*.scss').pipe(gulp.dest('./src/assets/vendors/bootstrap/scss/vendor'));
    return merge(style1,style2,style3,style4);
});
gulp.task('cloneVendorJS', () => {
    var script1 = gulp.src('./node_modules/bootstrap/js/src/*.js').pipe(gulp.dest('./src/assets/vendors/bootstrap/js'));
    var script2 = gulp.src('./node_modules/bootstrap/dist/js/*.js').pipe(gulp.dest('./src/assets/vendors/bootstrap/js'));
    var script3 = gulp.src('./node_modules/jquery/dist/jquery.min.js').pipe(gulp.dest('./src/assets/vendors/jquery'));
    return merge(script1,script2,script3);
});

gulp.task('initialSetup', series('cleanBuild','cloneVendorSCSS','cloneVendorJS'));




// Build Files //
// ------------------------------

gulp.task('buildCoreCSS', () => {
    return gulp.src(['./src/assets/vendors/bootstrap/scss/bootstrap.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('core.min.css'))
    .pipe(header(banner, { app: app }))
    .pipe(gulp.dest('./dist/assets/css'));
});
gulp.task('buildCoreJS', () => {
    return gulp.src(['./src/assets/vendors/jquery/jquery.min.js','./src/assets/vendors/bootstrap/js/bootstrap.min.js'])
    .pipe(concat('core.min.js'))
    .pipe(gulp.dest('./dist/assets/js'));
});
gulp.task('buildThemeCSS', () => {
    return gulp.src(['./src/assets/scss/main.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./dist/assets/css'));
});

gulp.task('buildCoreFiles', series('buildCoreCSS','buildCoreJS','buildThemeCSS'));


// Compile Views //
// ------------------------------

gulp.task('compileViews', function buildHTML() {
    return gulp.src('./src/views/index.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('./dist'));
  });






// Full Build //
// ------------------------------

gulp.task('mainBuild', series('initialSetup','buildCoreFiles','compileViews'));