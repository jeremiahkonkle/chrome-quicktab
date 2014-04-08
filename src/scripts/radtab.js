
/*
  Copywrite 2013 Jeremiah Konkle
*/

"use strict";

var rt_log = function(message) {
  console.log("RadTab: " + message);
}

var TabsMirror = require('./modules/tabs_mirror');
var DuplicateTabNotifier = require('./modules/duplicate_tab_notifier');

var tdc = new DuplicateTabNotifier(
  {tabs: new TabsMirror()}
);
rt_log("loaded");
