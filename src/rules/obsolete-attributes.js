HTMLInspector.addRule("obsolete-attributes", function(listener, reporter) {

  var obsoluteAttributes = HTMLInspector.extensions.attributes.obsoluteAttributes

  listener.on("attribute", function(name) {
    var el = this
      , nodeName = el.nodeName.toLowerCase()
    obsoluteAttributes.forEach(function(item) {
      if (
        item.attrs.indexOf(name) > -1
        && item.elements.indexOf(nodeName) > -1
      ) {
        reporter.addError(
          "obsolete-attributes",
          "The '" + name + "' attribute of the <" + nodeName + "> element is obsolete and should not be used.",
          el
        )
      }
    })
  })

})