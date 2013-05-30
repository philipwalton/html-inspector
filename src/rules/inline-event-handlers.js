HTMLInspector.addRule("inline-event-handlers", function(listener, reporter) {

  listener.on('attribute', function(name, value) {
    if (name.indexOf("on") === 0) {
      reporter.addError(
        "inline-event-handlers",
        "The '" + name + "' event handler was found inline in the HTML.",
        this
      )
    }
  })

})