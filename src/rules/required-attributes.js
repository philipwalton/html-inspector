HTMLInspector.addRule("required-attributes", function(listener, reporter) {

  var requiredAttributes = HTMLInspector.extensions.attributes.requiredAttributes

  listener.on("element", function(name) {
    var el = this
    requiredAttributes.forEach(function(item) {
      var hasAllAttrs
      if (name === item.element) {
        hasAllAttrs = item.attrs.every(function(attr) {
          return $(el).attr(attr) != null
        })
        if (!hasAllAttrs) {
          reporter.addError(
            "required-attributes",
            "<" + name + "> elements must include the following attributes: '" + item.attrs.join("', '") + "'.",
            el
          )
        }
      }
    })
  })

})