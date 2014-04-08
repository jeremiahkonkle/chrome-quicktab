#
# Mirrors chrome tab data so it can be accessed
# synchronously.
#

_ = require 'underscore'
BasicLogger = require './basic_logger'

class TabsMirror
  constructor: (@config = {}) ->
    @log = @config.logger or new BasicLogger(prefix: 'TabsMirror')
    @tabs = [] # this is where all the data will be
    @_update_tabs() # this puts it there
    @_add_listeners(); # this keeps it in sync

  find: (matcher) ->
    _.find @tabs, matcher
  
  _update_tabs: ->
    chrome.tabs.query {}, (tabs) =>
      @tabs = tabs
      @log.info("updated tabs: " + @tabs.length)

  _update_tabs_batched: ->
    # this batches the update tabs method so we only do the tabs.query once if a bunch of tab related events are fired in quick succession
    batch_dur = 500; 
    if @_batch_timeout then clearTimeout @_batch_timeout
  
    @_batch_timeout = setTimeout(
      => @_update_tabs(),
      batch_dur
    )
  
  _add_listeners: ->
    t = chrome.tabs;
    tab_events = [
      t.onCreated,
      t.onUpdated,
      t.onMoved,
      t.onDetached,
      t.onAttached,
      t.onRemoved,
      t.onReplaced
    ]
    for event in tab_events
      event.addListener(=> @_update_tabs_batched)

module.exports = TabsMirror