HTMLInspector.rules.add("validate-element-location", function(listener, reporter) {

  var validation = HTMLInspector.modules.validation

  listener.on("element", function(name) {
    // skip elements without a DOM element for a parent
    if (!(this.parentNode && this.parentNode.nodeType == 1)) return

    var child = name
      , parent = this.parentNode.nodeName.toLowerCase()

    if (validation.isChildDisallowedInParent(child, parent)) {
      reporter.warn(
        "validate-element-location",
        "The <" + child + "> element cannot be a child of the <" + parent + "> element.",
        this
      )
    }

  })

})