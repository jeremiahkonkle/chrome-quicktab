
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

chrome.browserAction.onClicked.addListener(function() {
  console.log("starting...");
  chrome.windows.getCurrent(function(curr_window) {
    console.log("sizing...")
    var w = 400;
    var h = 100;
    var left = (curr_window.width/2)-(w/2);
    var top = (curr_window.height * .25)-(h/2); 
  
    console.log("opening...")
     chrome.windows.create({
       'url': 'popup.html', 
       'type': 'popup',
       'width': w,
       'height': h,
       'top': Math.round(top),
       'left': Math.round(left)
     }, function(window) {});
  });
});