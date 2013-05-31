HTMLInspector.addRule("misused-attributes", function(listener, reporter) {

  var allowedAttributes = HTMLInspector.extensions.attributes.allowedAttributes

  listener.on("attribute", function(name) {
    var el = this
      , nodeName = el.nodeName.toLowerCase()
    allowedAttributes.forEach(function(item) {
      if (
        name === item.attr
        && item.elements.indexOf(nodeName) < 0
      ) {
        reporter.addError(
          "misused-attributes",
          "The '" + name + "' attribute cannot be used on a <" + nodeName + "> element.",
          el
        )
      }
    })
  })

})