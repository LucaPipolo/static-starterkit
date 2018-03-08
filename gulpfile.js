const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()

const pkg = require('./package.json')

const argv = require('minimist')(process.argv.slice(2))
const babel = require('gulp-babel')
const browserSync = require('browser-sync').create()
const eslint = require('gulp-eslint')
const gulpif = require('gulp-if')
const psiNgrok = require('psi-ngrok')
const runSequence = require('run-sequence')

const copyrightPlaceholder = '/*! #copyright DO NOT REMOVE# */'
const copyrightNotice = ['/*!',
  ' * ' + pkg.name + ' - ' + pkg.description,
  ' * @version v' + pkg.version,
  ' * @link ' + pkg.homepage,
  ' * @author ' + pkg.author,
  ' */',
  ''].join('\n')

const paths = {
  src: './src/',
  tmp: './.tmp/',
  dist: './dist/'
}

const options = {
  maps: !argv.production,
  pretty: !argv.production,
  compress: !argv.production
}

/**
 * Styles tasks.
 *
 * First lints sass files using stylelint, then compile them into a temporary
 * folder. Finally, generates sourcemaps (if `--production` option is not used)
 * and minify everything into the `dist`folder.
 */

gulp.task('styles:lint', function () {
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

gulp.task('styles:compile', function () {
  return gulp.src(paths.src + 'styles/**/*.scss')
    .pipe(plugins.sass({ outputStyle: 'expanded' }).on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(pkg.browserslist))
    .pipe(plugins.replace(copyrightPlaceholder, copyrightNotice))
    .pipe(gulp.dest(paths.tmp + 'styles/'))
})

gulp.task('styles:minify', function () {
  return gulp.src(paths.tmp + 'styles/*.css')
    .pipe(gulpif(options.maps,
      plugins.sourcemaps.init()
    ))
    .pipe(plugins.cssmin())
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(options.maps,
      plugins.sourcemaps.write('.', { sourceRoot: paths.src + 'styles/' })
    ))
    .pipe(gulp.dest(paths.dist + 'styles/'))
    .pipe(browserSync.stream())
})

gulp.task('styles:build', function (callback) {
  runSequence(
    'styles:lint',
    'styles:compile',
    'styles:minify',
    callback)
})

/**
 * Scripts tasks.
 *
 * First lints JavaScript files using eslint, then compile them into a temporary
 * folder. Finally, generates sourcemaps (if `--production` option is not used)
 * and minify everything into the `dist` folder.
 */

gulp.task('scripts:lint', function () {
  return gulp.src(paths.src + 'scripts/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('scripts:transpile', function () {
  return gulp.src(paths.src + 'scripts/**/*.js')
    .pipe(babel())
    .pipe(plugins.replace(copyrightPlaceholder, copyrightNotice))
    .pipe(gulp.dest(paths.tmp + 'scripts/'))
})

gulp.task('scripts:minify', function () {
  return gulp.src(paths.tmp + 'scripts/*.js')
    .pipe(gulpif(options.maps,
      plugins.sourcemaps.init()
    ))
    .pipe(plugins.uglify({ output: { comments: 'license' } }))
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.eol('\n'))
    .pipe(gulpif(options.maps,
      plugins.sourcemaps.write('.', { sourceRoot: paths.src + 'scripts/' })
    ))
    .pipe(gulp.dest(paths.dist + 'scripts/'))
    .pipe(browserSync.stream())
})

gulp.task('scripts:build', function (callback) {
  runSequence(
    'scripts:lint',
    'scripts:transpile',
    'scripts:minify',
    callback)
})

/**
 * Templates tasks.
 *
 * First copy the .htaccess file from the source folder to the dist one, then
 * lints and compiles pug templates. Finally, injects compiled CSS and JS
 * resources into compiled HTML. Note that we need two separate tasks for that
 * to use `async` on script tags.
 */

gulp.task('templates:lint', function () {
  return gulp.src(paths.src + 'templates/**/!(_)*.pug')
    .pipe(plugins.pugLinter())
    .pipe(plugins.pugLinter.reporter())
})

gulp.task('templates:compile', function () {
  return gulp.src(paths.src + 'templates/**/!(_)*.pug')
    .pipe(
      gulpif(options.compress,
        plugins.pug({ pretty: true }),
        plugins.pug()
      )
    )
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream())
})

gulp.task('templates:htaccess', function () {
  return gulp.src(paths.src + '.htaccess')
    .pipe(plugins.copy(paths.dist, { prefix: 1 }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream())
})

gulp.task('templates:injectCSS', function () {
  return gulp.src(paths.dist + 'index.html')
    .pipe(plugins.inject(
      gulp.src([
        paths.dist + 'styles/**/*.css'
      ], { read: false }),
      {
        relative: true,
        removeTags: true
      }
    ))
    .pipe(gulp.dest(paths.dist))
})

gulp.task('templates:injectJS', function () {
  return gulp.src(paths.dist + 'index.html')
    .pipe(plugins.inject(
      gulp.src([
        paths.dist + 'scripts/**/*.js'
      ], { read: false }),
      {
        relative: true,
        removeTags: true,
        transform: (path, file) => {
          return `<script src="${path}" async></script>`
        }
      }
    ))
    .pipe(gulp.dest(paths.dist))
})

gulp.task('templates:build', function (callback) {
  runSequence(
    'templates:htaccess',
    'templates:lint',
    'templates:compile',
    'templates:injectCSS',
    'templates:injectJS',
    callback)
})

/**
 * Images task.
 *
 * Compress and optimizes PNG, JPEG, GIF and SVG images.
 */

gulp.task('images', function () {
  return gulp.src(paths.src + 'images/**/*')
    .pipe(plugins.imagemin([
      plugins.imagemin.jpegtran({ progressive: true }),
      plugins.imagemin.gifsicle({ interlaced: true }),
      plugins.imagemin.optipng({ optimizationLevel: 5 }),
      plugins.imagemin.svgo({plugins: [{ removeUnknownsAndDefaults: false }, { cleanupIDs: false }]})
    ]))
    .pipe(gulp.dest(paths.dist + 'images/'))
})

/**
 * Fonts task.
 *
 * Flatten fonts into the dist folder.
 */

gulp.task('fonts', function () {
  return gulp.src(paths.src + 'fonts/**/*')
    .pipe(plugins.flatten())
    .pipe(gulp.dest(paths.dist + 'fonts/'))
})

/**
 * Performance task.
 *
 * It uses Ngrok and Google PageSpeed to perform a local performance test.
 */

gulp.task('performance:pagespeed-test', function () {
  psiNgrok()
})

/**
 * Build and watch task.
 *
 * Clean temporary and dist folders, then build everything.
 * Use `watch` to start a browserSync based server.
 * The default task is `build`.
 */

gulp.task('clean', require('del').bind(null, [
  paths.tmp,
  paths.dist
]))

gulp.task('default', function () {
  gulp.start('build')
})

gulp.task('build', ['clean'], function (callback) {
  runSequence(
    'styles:build',
    'scripts:build',
    'templates:build',
    'images',
    'fonts',
    'performance:pagespeed-test',
    callback)
})

gulp.task('watch', function () {
  browserSync.init({
    server: {
      baseDir: paths.dist
    }
  })
  gulp.watch([paths.src + 'styles/**/*'], ['styles:build'])
  gulp.watch([paths.src + 'scripts/**/*.js'], ['scripts:build'])
  gulp.watch([paths.src + 'templates/**/*'], ['templates:build'])
  gulp.watch([paths.src + 'images/**/*'], ['images'])
  gulp.watch([paths.src + 'fonts/**/*'], ['fonts'])
})
