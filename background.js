
/*
  Copywrite 2013 Jeremiah Konkle

  This file is part of QuickTab.

  QuickTab is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  QuickTab is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with QuickTab.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

// limits our intercepted requests to those requested in the
// main bar
var requests_filter = {urls: ["<all_urls>"], types: ['main_frame']}

var check_for_open_tab = function(details) {
  console.log("foo");
  return {cancel: !confirm("Really open this url?")};
}

chrome.webRequest.onBeforeRequest.addListener(
  check_for_open_tab, requests_filter, ['blocking']);
  
console.log("bar");