HTMLInspector.rules.add(
  "unused-classes",
  {
    whitelist: /^js\-|^supports\-|^language\-|^lang\-/
  },
  function(listener, reporter, config) {

    var css = HTMLInspector.modules.css
      , classes = css.getClassSelectors()

    listener.on('class', function(name) {
      if (!config.whitelist.test(name) && classes.indexOf(name) == -1) {
        reporter.warn(
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