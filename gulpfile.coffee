gulp = require 'gulp'
gutil = require 'gulp-util'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'
clean = require 'gulp-clean'
path = require 'path'
connect = require 'connect'


src_dir = "src"
build_dir = "build"

scripts_dir = "scripts"
scripts_entry = 'app.js'
scripts_exit = 'bundle.js'

app_file = 'index.html'

## BUILD - this does everything we need to do a one off build to get a runnable and testable build into the build directory
gulp.task 'build', ['build-scripts', 'build-html']

## DEV - sets up dev workflow and opens browser to served version of live full build
gulp.task 'dev', ['dev-serve', 'live-reload']

# sub-tasks that can be run standalone

gulp.task 'live-reload', ['build-watch'], ->
  lr_server = require('gulp-livereload')()
  gulp.watch(build_dir + '/**')
  .on 'change', (file) ->
    lr_server.changed file.path

gulp.task 'build-watch', ->
  all_scripts = path.join(src_dir, scripts_dir, '*.js')
  all_html = app_file
  gulp.watch all_scripts, ['build-scripts']
  gulp.watch all_html, ['build-html']


gulp.task 'build-scripts', ['clean-scripts'], ->
  src = path.join(src_dir, scripts_dir, scripts_entry)
  dest = path.join(build_dir, scripts_dir)
  
  gulp.src src
  .pipe browserify(insertGlobals: true, debug: true)
  .pipe rename(scripts_exit)
  .pipe gulp.dest(dest)
  
gulp.task 'clean-scripts', ->
  src = build_dir + scripts_dir
  gulp.src(src, {read: false}).pipe(clean())

gulp.task 'build-html', ->
  src = path.join(src_dir, app_file)
  gulp.src(src)
  .pipe gulp.dest(build_dir)
  
gulp.task 'dev-serve', ['build'], (task_complete) ->
  log = gutil.log
  colors = gutil.colors
  http = require 'http'
  open = require 'open'
  
  devApp = connect.server()
  .use connect.logger('dev')
  .use connect.static('build')

  # change port and hostname to something static if you prefer
  dev_server = http.createServer devApp
  .listen 0

  dev_server.on 'error', (error) ->
     # we couldn't start the server, so report it and quit gulp
    console.error 'Unable to start dev server!'
    task_complete error

  dev_server.on 'listening', ->
    d_address = dev_server.address();
    d_host = if d_address.address is '0.0.0.0' then 'localhost' else dev_server.address
    
    url = "http://#{d_host}:#{d_address.port}/#{app_file}"
    urlc = colors.magenta(url)
    
    console.info 'Started dev server at ' + urlc
    console.info 'Opening dev server URL in browser'
    open url
    
    task_complete()