
/*
  Copywrite 2013 Jeremiah Konkle
*/

"use strict";

// limits our intercepted requests to those requested in the
// main bar
var requests_filter = {urls: ["<all_urls>"], types: ['main_frame']}

var _tabs = [];
var update_tabs = function() {
  chrome.tabs.query({}, function(tabs) {
    _tabs = tabs;
  });
}
update_tabs();

var _batch_timeout;
var update_tabs_batched = function() {
  if (_batch_timeout) {
    clearTimeout(_batch_timeout);
  }
  _batch_timeout = setTimeout(update_tabs, 500);
}

chrome.tabs.onCreated.addListener(update_tabs_batched);
chrome.tabs.onUpdated.addListener(update_tabs_batched);
chrome.tabs.onMoved.addListener(update_tabs_batched);
chrome.tabs.onDetached.addListener(update_tabs_batched);
chrome.tabs.onAttached.addListener(update_tabs_batched);
chrome.tabs.onRemoved.addListener(update_tabs_batched);
chrome.tabs.onReplaced.addListener(update_tabs_batched);

var check_for_open_tab = function(request) {
  console.log("checking tabs: " + _tabs.length);
  var match_url = request.url;
  var result;
  for (var i=0; i < _tabs.length; i++) {
    if (_tabs[i].url == match_url && _tabs[i].id != request.tabId) {
      result = _tabs[i];
      break;
    }
  }
  
  console.log("found result");
  if (result) {
    if (confirm("This page is open in another tab. Open that tab?")) {
      console.log("doing tab switch. closing tab: " + request.tabId 
        + '. opening tab: ' + result.id
        + '. opending window: ' + result.windowId);
      chrome.windows.update(result.windowId, {focused: true});
      chrome.tabs.update(result.id, {active: true});
      if (request.tabId && request.tabId != result.id) {
        chrome.tabs.remove(request.tabId);
      }
      return {cancel: true};
    }
  }
  return {};
}

chrome.webRequest.onBeforeRequest.addListener(
  check_for_open_tab, requests_filter, ['blocking']);
  
console.log("foo");