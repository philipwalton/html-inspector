var observable = (function() {

  var events = {}

  return {
    on: function(event, fn) {
      events[event] || (events[event] = $.Callbacks())
      events[event].add(fn)
    },
    off: function(event, fn) {
      events[event] && events[event].remove(fn)
    },
    trigger: function(event, context, args) {
      events[event] && events[event].fireWith(context, args )
    },
    resetEvents: function() {
      events = {}
    }
  }

}())