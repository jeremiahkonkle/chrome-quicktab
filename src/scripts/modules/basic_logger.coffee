class Logger
  constructor: (@config) ->
  
  format_msg: (msg) ->
    @config.prefix + ": " + msg

Logger.prototype.info = 
Logger.prototype.debug = 
Logger.prototype.warn = 
Logger.prototype.error = (msg) ->
  console.log(@format_msg(msg));

module.exports = Logger