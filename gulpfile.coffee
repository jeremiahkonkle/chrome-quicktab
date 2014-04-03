gulp = require 'gulp'
gutil = require 'gulp-util'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'
clean = require 'gulp-clean'
path = require 'path'
open = require 'open'

src_dir = "src"
build_dir = "build"
static_dir = "static"

scripts_entry = 'quicktab.js'
scripts_exit = 'quicktab-bundle.js'

## BUILD - this does everything we need to do a one off build to get a runnable and testable build into the build directory
gulp.task 'build', ['build-all']

## DEV - sets up dev workflow and opens browser to served version of live full build
gulp.task 'dev', ['build', 'build-watch']

# sub-tasks that can be run standalone

gulp.task 'extensions-reload', ->
  gulp.watch(build_dir + '/**')
  .on 'change', (file) ->
    open 'http://reload.extensions'

gulp.task 'build-watch', ->
  all_scripts = path.join(src_dir, '**')
  all_static = path.join(static_dir, '**')
  console.log(all_scripts)
  console.log(all_static)
  gulp.watch all_scripts, ['build']
  gulp.watch all_static, ['build']

gulp.task 'build-all', ['clean'], ->
  src = path.join(src_dir, scripts_entry)
  dest = path.join(build_dir)
  
  gulp.src src
  .pipe browserify(insertGlobals: true, debug: true)
  .pipe rename(scripts_exit)
  .pipe gulp.dest(dest)
  
  src = static_dir + "/**"
  gulp.src(src)
  .pipe gulp.dest(build_dir)

gulp.task 'clean', ->
  src = build_dir + "/**" # everything except dirs
  gulp.src(src, {read: false}).pipe(clean())
  