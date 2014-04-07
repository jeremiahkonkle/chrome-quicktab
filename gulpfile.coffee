gulp = require 'gulp'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'
clean = require 'gulp-clean'
open = require 'open'

src_dir = "src"
build_dir = "build"
static_dir = "src/static"
scripts_dir = "src/scripts"
scripts_entry = 'radtab.js'
scripts_exit = 'radtab-bundle.js'

## BUILD - this does everything we need to do a one off build to get a runnable and testable build into the build directory
gulp.task 'build', ['build-all']

## DEV - sets up dev workflow and opens browser to served version of live full build
gulp.task 'dev', ['build-watch']

# sub-tasks that can be run standalone

gulp.task 'build-watch', ['build'], ->
  gulp.watch "#{src_dir}/**", debounceDelay:500, ['build']

gulp.task 'build-all', ['clean'], ->
  # build and bundle scripts
  gulp.src "#{scripts_dir}/#{scripts_entry}"
  .pipe browserify(insertGlobals: true, debug: true)
  .pipe rename(scripts_exit)
  .pipe gulp.dest(build_dir)
  
  # cp static files
  src = static_dir + "/**"
  gulp.src(src)
  .pipe gulp.dest(build_dir)

gulp.task 'clean', ->
  src = build_dir + "/**" # everything except dirs
  gulp.src(src, {read: false}).pipe(clean())