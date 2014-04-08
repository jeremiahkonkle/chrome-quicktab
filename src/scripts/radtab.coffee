#
# Copyright 2014 Jeremiah Konkle
#

TabsMirror = require './modules/tabs_mirror'
DuplicateTabNotifier = require './modules/duplicate_tab_notifier'

tdc = new DuplicateTabNotifier(
  tabs: new TabsMirror()
)

console.log "Radtab: loaded"