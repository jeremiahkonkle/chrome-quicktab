
/*
  Copywrite 2013 Jeremiah Konkle
*/

"use strict";

var main = function() {
  // this kicks it off, we call main() at the bottom of this file
  var tab_dupe_checker = new TabDuplicateChecker();
  rt_log("loadedfive");
}

var TabDuplicateChecker = function(config) {
  var self = this;
  
  // live tab mirror so we can query synchronously
  this.tabs = new TabsMirror();
  
  chrome.webRequest.onBeforeRequest.addListener(
    function(request) { self.handle_request(request); },
    this.get_watched_requests_filter(),
    ['blocking']
  );
};

TabDuplicateChecker.prototype.get_watched_requests_filter = function () {
  return {
    urls: ["<all_urls>"], // we watch all urls
    types: ['main_frame'] // that are loaded into the main window. basically anything that goes in the url bar.
  };
};

TabDuplicateChecker.prototype.handle_request = function (request) {
  rt_log("checking request: " + request.url);
  var existing_tab = this.tabs.tab_with_url(request.url);
  if (existing_tab && existing_tab.id != request.tabId) {
    rt_log("found existing tab");
    if (this.should_use_existing_tab()) {
      this.switch_to_existing_tab(existing_tab, request.tabId);
      return {cancel: true}; // cancels original request
    }
  }
};

TabDuplicateChecker.prototype.should_use_existing_tab = function () {
  return confirm("This page is open in another tab. Open that tab?");
};

TabDuplicateChecker.prototype.switch_to_existing_tab = function (existing_tab, curr_tab_id) {
  rt_log("switching to existing tab");
  
  chrome.windows.update(existing_tab.windowId, {focused: true});
  chrome.tabs.update(existing_tab.id, {active: true});
  
  if (this.should_close_curr_tab(existing_tab, curr_tab_id)) {
    rt_log("closing source tab");
    chrome.tabs.remove(curr_tab_id);
  }
};

TabDuplicateChecker.prototype.should_close_curr_tab = function (existing_tab, curr_tab_id) {
  return (curr_tab_id && curr_tab_id != existing_tab.id);
};
  
/*  Mirrors chrome tab data so it can be accessed
    synchronously. */
var TabsMirror = function() {
  this.tabs = []; // this is where all the data will be
  this._update_tabs(); // this puts it there
  this._add_listeners(); // this keeps it in sync
};

TabsMirror.prototype.tab_with_url = function(url) {
  for (var i=0; i < this.tabs.length; i++) {
    if (this.tabs[i].url == url) {
      return this.tabs[i];
    }
  }
  return null;
};

TabsMirror.prototype._update_tabs = function() {
  var self = this;
  chrome.tabs.query({}, function(tabs) {
    self.tabs = tabs;
    rt_log("updated tabs: " + self.tabs.length);
  });
}

TabsMirror.prototype._update_tabs_batched = function () {
  // this batches the update tabs method so we only do the tabs.query once if a bunch of tab related events are fired in quick succession
  var self = this;
  var batch_dur = 500; 
  
  if (this._batch_timeout) {
    clearTimeout(this._batch_timeout);
  }
  
  this._batch_timeout = setTimeout(
    function() { self._update_tabs(); },
    batch_dur
  );
};

TabsMirror.prototype._add_listeners = function () {
  var self = this;
  var t = chrome.tabs;
  var tab_events = [
    t.onCreated,
    t.onUpdated,
    t.onMoved,
    t.onDetached,
    t.onAttached,
    t.onRemoved,
    t.onReplaced
  ];
  tab_events.map(function(event) {
    event.addListener(function() {
      self._update_tabs_batched();
    });
  });
};

var rt_log = function(message) {
  console.log("RadTab: " + message);
}

main();