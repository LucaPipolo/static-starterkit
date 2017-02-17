# IIFE - Immediately Invoked Function Expression
((project) ->
  project window.jQuery, window, document
  return
) ($, window, document) ->
  # The $ is now locally scoped
  # Listen for the jQuery ready event on the document
  $ ->
    console.log 'The DOM is ready'
    # The DOM is ready!
    return
  console.log 'The DOM may not be ready'
  # The rest of code goes here!
  return
