# IIFE - Immediately Invoked Function Expression
((project) ->
  project window.jQuery, window, document
  return
) ($, window, document) ->
  # The $ is now locally scoped
  # Listen for the jQuery ready event on the document
  $ ->
    # The DOM is ready!
    return
  # The rest of code goes here!
  return
