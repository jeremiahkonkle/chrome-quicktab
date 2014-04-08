
var BasicLogger = require('./basic_logger');

var DuplicateTabNotifier = module.exports = function(config) {
  var self = this;
  this.log = config.logger || new BasicLogger({prefix:'DuplicateTabNotifier'});
  
  // live tab mirror so we can query synchronously
  this.tabs = config.tabs || [];
  
  chrome.webRequest.onBeforeRequest.addListener(
    function(request) { self.handle_request(request); },
    this.get_watched_requests_filter(),
    ['blocking']
  );
};

DuplicateTabNotifier.prototype.get_watched_requests_filter = function () {
  return {
    urls: ["<all_urls>"], // we watch all urls
    types: ['main_frame'] // that are loaded into the main window. basically anything that goes in the url bar.
  };
};

DuplicateTabNotifier.prototype.handle_request = function (request) {
  this.log.info("checking request: " + request.url);
  var existing_tab = this.tabs.tab_with_url(request.url);
  if (existing_tab && existing_tab.id != request.tabId) {
    this.log.info("found existing tab");
    if (this.should_use_existing_tab()) {
      this.switch_to_existing_tab(existing_tab, request.tabId);
      return {cancel: true}; // cancels original request
    }
  }
};

DuplicateTabNotifier.prototype.should_use_existing_tab = function () {
  return confirm("This page is open in another tab. Open that tab?");
};

DuplicateTabNotifier.prototype.switch_to_existing_tab = function (existing_tab, curr_tab_id) {
  this.log.info("switching to existing tab");
  
  chrome.windows.update(existing_tab.windowId, {focused: true});
  chrome.tabs.update(existing_tab.id, {active: true});
  
  if (this.should_close_curr_tab(existing_tab, curr_tab_id)) {
    this.log.info("closing source tab");
    chrome.tabs.remove(curr_tab_id);
  }
};

DuplicateTabNotifier.prototype.should_close_curr_tab = function (existing_tab, curr_tab_id) {
  return (curr_tab_id && curr_tab_id != existing_tab.id);
};