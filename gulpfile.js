var gulp = require('gulp')
var plugins = require('gulp-load-plugins')()

var pkg = require('./package.json')

var argv = require('minimist')(process.argv.slice(2))
var browserSync = require('browser-sync').create()
var gulpif = require('gulp-if')
var gulpFilter = require('gulp-filter')
var runSequence = require('run-sequence')
var eslint = require('gulp-eslint')
var babel = require('gulp-babel')

var paths = {
  src: './src/',
  tmp: './.tmp/',
  dist: './dist/'
}

var options = {
  maps: !argv.production,
  pretty: !argv.production
}

// -----------------------------------------------------------------------------
//   Bower pipeline
// -----------------------------------------------------------------------------
gulp.task('bower:styles', function () {
  var filterCSS = gulpFilter('**/*.css', { restore: true })
  return gulp.src('./bower.json')
    .pipe(plugins.mainBowerFiles())
    .pipe(filterCSS)
    .pipe(gulpif(options.maps, plugins.sourcemaps.init()))
    .pipe(plugins.concat('libs.min.css'))
    .pipe(plugins.cssmin())
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(options.maps, plugins.sourcemaps.write('.')))
    .pipe(gulp.dest(paths.dist + 'styles'))
    .pipe(filterCSS.restore)
    .pipe(browserSync.stream())
})

gulp.task('bower:scripts', function () {
  var filterJS = gulpFilter('**/*.js', { restore: true })
  return gulp.src('./bower.json')
    .pipe(plugins.mainBowerFiles())
    .pipe(filterJS)
    .pipe(gulpif(options.maps, plugins.sourcemaps.init()))
    .pipe(plugins.concat('libs.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(options.maps, plugins.sourcemaps.write('.')))
    .pipe(gulp.dest(paths.dist + 'scripts'))
    .pipe(filterJS.restore)
    .pipe(browserSync.stream())
})

gulp.task('bower:images', function () {
  var filterImgs = gulpFilter(['**/*.jpg', '**/*.png', '**/*.gif'], { restore: true })
  return gulp.src('./bower.json')
    .pipe(plugins.mainBowerFiles())
    .pipe(filterImgs)
    .pipe(plugins.flatten())
    .pipe(plugins.imagemin([
      plugins.imagemin.jpegtran({progressive: true}),
      plugins.imagemin.gifsicle({interlaced: true}),
      plugins.imagemin.svgo({plugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]})
    ]))
    .pipe(gulp.dest(paths.dist + 'images'))
    .pipe(filterImgs.restore)
    .pipe(browserSync.stream())
})

gulp.task('bower:fonts', function () {
  var filterFonts = gulpFilter(['**/*.svg', '**/*.ttf', '**/*.eot', '**/*.woff'], { restore: true })
  return gulp.src('./bower.json')
    .pipe(plugins.mainBowerFiles())
    .pipe(filterFonts)
    .pipe(plugins.flatten())
    .pipe(gulp.dest(paths.dist + 'fonts'))
    .pipe(filterFonts.restore)
    .pipe(browserSync.stream())
})

gulp.task('clean:bower', require('del').bind(null, [
  paths.dist + 'styles/libs*',
  paths.dist + 'scripts/libs*'
]))

// -----------------------------------------------------------------------------
//   Template pipeline
// -----------------------------------------------------------------------------
gulp.task('lint:pug', function () {
  return gulp.src(paths.src + 'templates/**/!(_)*.pug')
    .pipe(plugins.pugLinter())
    .pipe(plugins.pugLinter.reporter())
})

gulp.task('compile:pug', function () {
  return gulp.src(paths.src + 'templates/**/!(_)*.pug')
    .pipe(gulpif(options.maps, plugins.pug({pretty: true}), plugins.pug()))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream())
})

gulp.task('clean:templates', require('del').bind(null, [
  paths.dist + '*.html'
]))

gulp.task('build:templates', ['clean:templates'], function (callback) {
  runSequence(
    'lint:pug',
    'compile:pug',
    callback)
})

// -----------------------------------------------------------------------------
//   Style pipeline
// -----------------------------------------------------------------------------
gulp.task('lint:sass', function () {
  return gulp.src(paths.src + 'styles/**/*.scss', {base: './'})
    .pipe(plugins.csscomb())
    .pipe(plugins.stylelint({
      syntax: 'scss',
      reporters: [{
        formatter: 'string',
        console: true
      }]
    }))
    .pipe(gulp.dest('./'))
})

gulp.task('compile:sass', function () {
  return gulp.src(paths.src + 'styles/**/*.scss')
    .pipe(plugins.sass({outputStyle: 'expanded'}).on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(pkg.browserslist))
    .pipe(gulp.dest(paths.tmp + 'styles/'))
})

gulp.task('minify:css', function () {
  return gulp.src(paths.tmp + 'styles/*.css')
    .pipe(gulpif(options.maps, plugins.sourcemaps.init()))
    .pipe(plugins.cssmin())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(options.maps, plugins.sourcemaps.write('.', {sourceRoot: paths.src + 'styles/'})))
    .pipe(gulp.dest(paths.dist + 'styles/'))
    .pipe(browserSync.stream())
})

gulp.task('clean:styles', require('del').bind(null, [
  paths.tmp + 'styles/',
  paths.dist + 'styles/'
]))

gulp.task('build:styles', ['clean:styles'], function (callback) {
  runSequence(
    'bower:styles',
    'lint:sass',
    'compile:sass',
    'minify:css',
    callback)
})

// -----------------------------------------------------------------------------
//   Script pipeline
// -----------------------------------------------------------------------------
gulp.task('lint:js', function () {
  return gulp.src(paths.src + 'scripts/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('transpile:es2016', function () {
  return gulp.src(paths.src + 'scripts/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest(paths.tmp + 'scripts/'))
})

gulp.task('minify:js', function () {
  return gulp.src(paths.tmp + 'scripts/*.js')
    .pipe(gulpif(options.maps, plugins.sourcemaps.init()))
    .pipe(plugins.uglify({
      preserveComments: 'license'
    }))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(options.maps, plugins.sourcemaps.write('.', {sourceRoot: paths.src + 'scripts/'})))
    .pipe(gulp.dest(paths.dist + 'scripts/'))
    .pipe(browserSync.stream())
})

gulp.task('clean:scripts', require('del').bind(null, [
  paths.tmp + 'scripts/',
  paths.dist + 'scripts/'
]))

gulp.task('build:scripts', ['clean:scripts'], function (callback) {
  runSequence(
    'bower:scripts',
    'lint:js',
    'transpile:es2016',
    'minify:js',
    callback)
})

// -----------------------------------------------------------------------------
//   Images pipeline
// -----------------------------------------------------------------------------
gulp.task('images', function () {
  return gulp.src(paths.src + 'images/**/*')
    .pipe(plugins.imagemin([
      plugins.imagemin.jpegtran({progressive: true}),
      plugins.imagemin.gifsicle({interlaced: true}),
      plugins.imagemin.svgo({plugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]})
    ]))
    .pipe(gulp.dest(paths.dist + 'images/'))
})

// -----------------------------------------------------------------------------
//   Fonts pipeline
// -----------------------------------------------------------------------------
gulp.task('fonts', function () {
  return gulp.src(paths.src + 'fonts/**/*')
    .pipe(plugins.flatten())
    .pipe(gulp.dest(paths.dist + 'fonts/'))
})

// -----------------------------------------------------------------------------
//   Tasks
// -----------------------------------------------------------------------------
gulp.task('clean', require('del').bind(null, [
  paths.tmp,
  paths.dist
]))

gulp.task('default', function () {
  gulp.start('build')
})

gulp.task('build', ['clean'], function (callback) {
  runSequence(
    'build:templates',
    'build:styles',
    'build:scripts',
    ['bower:styles', 'bower:scripts', 'bower:images', 'bower:fonts', 'images', 'fonts'],
    callback)
})

gulp.task('watch', function () {
  browserSync.init({
    server: {
      baseDir: paths.dist
    }
  })
  gulp.watch(['./bower.json'], ['clean:bower', 'bower:styles', 'bower:scripts', 'bower:images', 'bower:fonts'])
  gulp.watch([paths.src + 'templates/**/*'], ['build:templates'])
  gulp.watch([paths.src + 'styles/**/*'], ['build:styles'])
  gulp.watch([paths.src + 'scripts/**/*.js'], ['build:scripts'])
  gulp.watch([paths.src + 'images/**/*'], ['images'])
  gulp.watch([paths.src + 'fonts/**/*'], ['fonts'])
})
