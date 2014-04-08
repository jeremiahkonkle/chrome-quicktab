var Logger = module.exports = function(config) {
  this.config = config;
};

Logger.prototype.info = Logger.prototype.debug = Logger.prototype.warn = Logger.prototype.error = function(msg) {
  console.log(this.format_msg(msg));
};

Logger.prototype.format_msg = function(msg) {
  return this.config.prefix + ": " + msg;
};