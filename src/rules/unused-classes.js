HTMLInspector.addRule(
  "unused-classes",
  {
    whitelist: /^js\-|^supports\-|^language\-|^lang\-/
  },
  function(listener, reporter, config) {

    var css = HTMLInspector.extensions.css
      , classes = css.getClassSelectors()

    listener.on('class', function(name) {
      if (!config.whitelist.test(name) && classes.indexOf(name) == -1) {
        reporter.addError(
          "unused-classes",
          "The class '"
          + name
          + "' is used in the HTML but not found in any stylesheet.",
          this
        )
      }
    }
  )
})