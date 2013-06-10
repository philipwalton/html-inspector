HTMLInspector.rules.add("inline-event-handlers", function(listener, reporter) {

  listener.on('attribute', function(name, value) {
    if (name.indexOf("on") === 0) {
      reporter.warn(
        "inline-event-handlers",
        "An '" + name + "' attribute was found in the HTML. Use external scripts for event binding instead.",
        this
      )
    }
  })

})