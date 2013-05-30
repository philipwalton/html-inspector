HTMLInspector.addRule("unused-classes", function(listener, reporter) {

  var css = this.extensions.css
    , whitelist = css.whitelist
    , classes = css.getClassSelectors()

  listener.on('class', function(name) {
    if (!whitelist.test(name) && classes.indexOf(name) == -1) {
      reporter.addError(
        "unused-classes",
        "The class '"
        + name
        + "' is used in the HTML but not found in any stylesheet.",
        this
      )
    }
  })

})