HTMLInspector.addRule({
  id: "unused-classes",
  init: function() {
    var whitelist = /^js\-|^supports\-|^language\-|^lang\-/
      , classes = this.styleSheets.getClassSelectors()

    this.on('class', function(cls, el) {
      if (!whitelist.test(cls) && classes.indexOf(cls) == -1) {
        this.report(
          "unused-classes",
          "The class '"
          + cls
          + "' is used in the HTML but not found in any stylesheet",
          el
        )
      }
    });
  }
});