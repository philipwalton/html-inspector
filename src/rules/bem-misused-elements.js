HTMLInspector.addRule("bem-misused-elements", function(listener, reporter) {

  var bem = this.extensions.bem

  listener.on('class', function(name) {
    if (bem.isBlockElement(name)) {
      // check the ancestors for the block class
      if (!$(this).parents().is("." + bem.getBlockName(name))) {
        reporter.addError(
          "bem-misused-modifier",
          "The BEM element '" + name
          + "' must be a descendent of '" + bem.getBlockName(name)
          + "'.",
          this
        )
      }
    }
  })

})