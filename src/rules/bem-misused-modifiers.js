HTMLInspector.addRule("bem-misused-modifiers", function(listener, reporter) {

  var bem = this.extensions.bem

  listener.on('class', function(name) {
    if (bem.isBlockModifier(name)) {
      if (!$(this).is("." + bem.getBlockName(name))) {
        reporter.addError(
          "bem-misused-modifiers",
          "The BEM modifier class '" + name
          + "' was found without the block base class '" + bem.getBlockName(name)
          +  "'.",
          this
        )
      }
    }
  })

})