#
# Notfies the user when they navigate to a url that
# they have open in another tab and gives them the
# option to focus on that tab instead.
#

BasicLogger = require('./basic_logger');

class DuplicateTabNotifier
  constructor: (@config = {}) ->
    @log = config.logger || new BasicLogger({prefix:'DuplicateTabNotifier'});
  
    # we require that this is an up-to-date or live syncronizing list of open tabs so we can query it synchronously
    @tabs = config.tabs || [];
    
    chrome.webRequest.onBeforeRequest.addListener(
      (request) => @handle_request request,
      @watched_requests_filter,
      ['blocking']
    )

  watched_requests_filter:
    urls: ["<all_urls>"], # we watch all urls
    types: ['main_frame'] # that are loaded into the main window. basically anything that goes in the url bar.

  handle_request: (request) ->
    @log.info "checking request: " + request.url
    
    existing_tab = @tabs.find (tab) =>
      tab.url is request.url and tab.id != request.tabId
    
    @log.info "existing tab: #{existing_tab}"
    if existing_tab
      @log.info "found existing tab"
      if @should_use_existing_tab()
        @switch_to_existing_tab existing_tab, request.tabId
        return cancel: true # cancels original request
    
  should_use_existing_tab: ->
    confirm "This page is open in another tab. Open that tab?"

  switch_to_existing_tab: (existing_tab, curr_tab_id) ->
    @log.info "switching to existing tab"
    
    chrome.windows.update(existing_tab.windowId, focused: true)
    chrome.tabs.update(existing_tab.id, active: true)
    
    if @should_close_curr_tab existing_tab, curr_tab_id
      @log.info "closing source tab"
      chrome.tabs.remove curr_tab_id

  should_close_curr_tab: (existing_tab, curr_tab_id) ->
    (curr_tab_id and curr_tab_id != existing_tab.id)

module.exports = DuplicateTabNotifier