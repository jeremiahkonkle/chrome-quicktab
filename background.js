
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

var quickTabConfig = function chromeConfig() {
  var omnibox = chrome.omnibox;
  var tabs = chrome.tabs;
  var windows = chrome.windows;
  
  return {
    addInputChangedListener: function(listener) { omnibox.onInputChanged.addListener(listener); },
    addInputConfirmedListener: function(listener) { omnibox.onInputEntered.addListener(listener); },
    setDefaultSuggestion: function (sug) { omnibox.setDefaultSuggestion({description: sug.text}); },
    getAllTabs: function(result) { tabs.query({}, result); },
    suggestionFromTab: function(tab, sugFactory) { return sugFactory.make(tab.id, tab.title); },
    activateTab: function(tab_id) { tabs.update(tab_id, {active: true}); },
    activateWindow: function(window_id) { windows.update(window_id, {focused: true}); },
    suggestionFormatter: function(prefix) {
      this.formatSuggestion = function(sug) {
        return { 
          content: prefix+sug.key, 
          description: sug.text
        }
      }
    },
    // and some configurables
    keyPrefix: "tab:",
    noneFoundText: "No Tabs Found (Open Blank?)"
  };
}

var QuickTab = (function(config) {
  var self = config;
  
  self.init = function() {
    self.curr_primary = null,
    self.sugFactory = new SuggestionFactory(
        self.suggestionFormatter(self.prefix)
    );
    
    self.addInputChangedListener(self.suggestionListener);
    self.addInputConfirmedListener(self.confirmedListener);
    
    self.suggestionListener("java", function(suggestions) { console.dir(suggestions); });
  };
  
  self.suggestionListener = function(text, setSuggestions) {
    self.getSuggestions(text, function(suggestions) {
      console.log("about to");
      console.dir(suggestions);
      self.setDefaultSuggestion(suggestions.primary);
      console.log("quite");
      self.curr_primary = suggestions.primary;
      setSuggestions( suggestions.additional.map(self.formatSuggestion) );
    });
  };
  
  self.getSuggestions = function(text, return_result) {
    self.allPossibleSuggestions(function(suggestions) {
      suggestions = self.filterSuggestions(text, suggestions);
      suggestions = self.separateFirstSuggestion(suggestions);
      
      return_result({
        primary: suggestions.first ? suggestions.first : self.sugFactory.make("", self.noneFoundText),
        additional: suggestions.rest
      });
    });
  };

  self.allPossibleSuggestions = function(return_result) {
    self.getAllTabs(function(tabs) {
      //console.dir(tabs);
      var suggestions = tabs.map(function(tab) {
        return self.suggestionFromTab(tab, self.sugFactory);
      });
      return_result(suggestions);
    });
  };
  
  self.filterSuggestions = function(filter_val, suggestions) {
    var is_match = self.getRegExp(filter_val);
    return suggestions.filter( function(sug) { return is_match.test(sug.matchable_text()); });
  };

  self.getRegExp = function(filter_val) {
    var len=filter_val.length, i=0, pattern = ".*";
    for (i=0; i < len; i+=1) {
      pattern += filter_val.charAt(i) + ".*";
    }
    return new RegExp(pattern);
  };
  
  self.separateFirstSuggestion = function(suggestions) {
    var result = {first: null, rest: []};
    if (suggestions.length) {
      result.first = suggestions[0];
      result.rest = suggestions.slice(1);
    }
    return result;
  };
  
  self.confirmedListener = function(input) {
    var tab_id;
    if (input.indexOf("tab:") === 0) {
      tab_id = Number(input.slice(4));
      self.getTab(tab_id, function(tab) { 
        self.selectTab();
      });
    } else {
      if (self.curr_primary) {
        self.selectTab(self.curr_primary);
      }
    }
  };
  
  self.selectTab = function(tab) {
    self.activateTab(tab.id);
    self.activateWindow(tab.windowId);
  }
  
  var SuggestionFactory = function(formatter, key_prefix) {
    this.formatter = formatter;
  
    var Suggestion = function(key, text, matches) {
      var self = this;
    
      self.init = function() {
        self.text = text;
        self.key = self.normalizeKey(key);
        self.matches = matches;
      }
    
      self.normalizeKey = function(key) {
        key = ""+key; // cast to string
        console.log(key);
        if (key.indexOf(key_prefix) === 0) {
          key = Number(key.slice(key_prefix.length));
        }
        return key;
      };
    
      self.get = function() {
        formatter(the_sug);
      };
      
      self.matchable_text = function() {
        if (!self._matchableText) {
          self._matchableText = self.text.toLowerCase();
        }
        return self._matchableText;
      };
    
      self.init();
    };
  
    this.make = function(key, text, matches) {
      return new Suggestion(key, text, matches);
    };
  };
  
  self.init();
    
})( quickTabConfig() );

