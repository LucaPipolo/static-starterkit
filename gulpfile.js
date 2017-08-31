var gulp = require('gulp')
var plugins = require('gulp-load-plugins')()

var argv = require('minimist')(process.argv.slice(2))
var browserSync = require('browser-sync').create()
var gulpif = require('gulp-if')
var gulpFilter = require('gulp-filter')
var runSequence = require('run-sequence')
var eslint = require('gulp-eslint')
var babel = require('gulp-babel')

var options = {
  srcFolder: './src/',
  tmpFolder: './.tmp/',
  distFolder: './dist/'
}

var enabled = {
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
    .pipe(gulpif(enabled.maps, plugins.sourcemaps.init()))
    .pipe(plugins.concat('libs.min.css'))
    .pipe(plugins.cssmin())
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(enabled.maps, plugins.sourcemaps.write('.')))
    .pipe(gulp.dest(options.distFolder + 'styles'))
    .pipe(filterCSS.restore)
    .pipe(browserSync.stream())
})

gulp.task('bower:scripts', function () {
  var filterJS = gulpFilter('**/*.js', { restore: true })
  return gulp.src('./bower.json')
    .pipe(plugins.mainBowerFiles())
    .pipe(filterJS)
    .pipe(gulpif(enabled.maps, plugins.sourcemaps.init()))
    .pipe(plugins.concat('libs.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(enabled.maps, plugins.sourcemaps.write('.')))
    .pipe(gulp.dest(options.distFolder + 'scripts'))
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
    .pipe(gulp.dest(options.distFolder + 'images'))
    .pipe(filterImgs.restore)
    .pipe(browserSync.stream())
})

gulp.task('bower:fonts', function () {
  var filterFonts = gulpFilter(['**/*.svg', '**/*.ttf', '**/*.eot', '**/*.woff'], { restore: true })
  return gulp.src('./bower.json')
    .pipe(plugins.mainBowerFiles())
    .pipe(filterFonts)
    .pipe(plugins.flatten())
    .pipe(gulp.dest(options.distFolder + 'fonts'))
    .pipe(filterFonts.restore)
    .pipe(browserSync.stream())
})

gulp.task('clean:bower', require('del').bind(null, [
  options.distFolder + 'styles/libs*',
  options.distFolder + 'scripts/libs*'
]))

// -----------------------------------------------------------------------------
//   Template pipeline
// -----------------------------------------------------------------------------
gulp.task('lint:pug', function () {
  return gulp.src(options.srcFolder + 'templates/**/!(_)*.pug')
    .pipe(plugins.pugLinter())
    .pipe(plugins.pugLinter.reporter())
})

gulp.task('compile:pug', function () {
  return gulp.src(options.srcFolder + 'templates/**/!(_)*.pug')
    .pipe(gulpif(enabled.maps, plugins.pug({pretty: true}), plugins.pug()))
    .pipe(gulp.dest(options.distFolder))
    .pipe(browserSync.stream())
})

gulp.task('clean:templates', require('del').bind(null, [
  options.distFolder + '*.html'
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
  return gulp.src(options.srcFolder + 'styles/**/*.scss', {base: './'})
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
  return gulp.src(options.srcFolder + 'styles/**/*.scss')
    .pipe(plugins.sass({outputStyle: 'expanded'}).on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(), {
      browsers: [
        'last 2 versions',
        'ie 8',
        'ie 9',
        'android 2.3',
        'android 4',
        'opera 12'
      ]
    })
    .pipe(gulp.dest(options.tmpFolder + 'styles/'))
})

gulp.task('minify:css', function () {
  return gulp.src(options.tmpFolder + 'styles/*.css')
    .pipe(gulpif(enabled.maps, plugins.sourcemaps.init()))
    .pipe(plugins.cssmin())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(enabled.maps, plugins.sourcemaps.write('.', {sourceRoot: options.srcFolder + 'styles/'})))
    .pipe(gulp.dest(options.distFolder + 'styles/'))
    .pipe(browserSync.stream())
})

gulp.task('clean:styles', require('del').bind(null, [
  options.tmpFolder + 'styles/',
  options.distFolder + 'styles/'
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
  return gulp.src(options.srcFolder + 'scripts/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('transpile:es2016', function () {
  return gulp.src(options.srcFolder + 'scripts/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest(options.tmpFolder + 'scripts/'))
})

gulp.task('minify:js', function () {
  return gulp.src(options.tmpFolder + 'scripts/*.js')
    .pipe(gulpif(enabled.maps, plugins.sourcemaps.init()))
    .pipe(plugins.uglify({
      preserveComments: 'license'
    }))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(enabled.maps, plugins.sourcemaps.write('.', {sourceRoot: options.srcFolder + 'scripts/'})))
    .pipe(gulp.dest(options.distFolder + 'scripts/'))
    .pipe(browserSync.stream())
})

gulp.task('clean:scripts', require('del').bind(null, [
  options.tmpFolder + 'scripts/',
  options.distFolder + 'scripts/'
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
  return gulp.src(options.srcFolder + 'images/**/*')
    .pipe(plugins.imagemin([
      plugins.imagemin.jpegtran({progressive: true}),
      plugins.imagemin.gifsicle({interlaced: true}),
      plugins.imagemin.svgo({plugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]})
    ]))
    .pipe(gulp.dest(options.distFolder + 'images/'))
})

// -----------------------------------------------------------------------------
//   Fonts pipeline
// -----------------------------------------------------------------------------
gulp.task('fonts', function () {
  return gulp.src(options.srcFolder + 'fonts/**/*')
    .pipe(plugins.flatten())
    .pipe(gulp.dest(options.distFolder + 'fonts/'))
})

// -----------------------------------------------------------------------------
//   Tasks
// -----------------------------------------------------------------------------
gulp.task('clean', require('del').bind(null, [
  options.tmpFolder,
  options.distFolder
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
      baseDir: options.distFolder
    }
  })
  gulp.watch(['./bower.json'], ['clean:bower', 'bower:styles', 'bower:scripts', 'bower:images', 'bower:fonts'])
  gulp.watch([options.srcFolder + 'templates/**/*'], ['build:templates'])
  gulp.watch([options.srcFolder + 'styles/**/*'], ['build:styles'])
  gulp.watch([options.srcFolder + 'scripts/**/*.js'], ['build:scripts'])
  gulp.watch([options.srcFolder + 'images/**/*'], ['images'])
  gulp.watch([options.srcFolder + 'fonts/**/*'], ['fonts'])
})
