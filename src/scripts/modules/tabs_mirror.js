var rt_log = function(message) {
  console.log("RadTab: " + message);
};

/*  Mirrors chrome tab data so it can be accessed
    synchronously. */
var TabsMirror = module.exports = function() {
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

