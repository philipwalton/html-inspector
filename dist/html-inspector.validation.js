HTMLInspector.rules.add("duplicate-ids", function(listener, reporter) {

  var elements = []

  listener.on("id", function(name) {
    elements.push({id: name, context: this})
  })

  listener.on("afterInspect", function() {

    var duplicates = []
      , element
      , offenders

    while (element = elements.shift()) {
      // find other elements with the same ID
      duplicates = elements.filter(function(el) {
        return element.id === el.id
      })
      // remove elements with the same ID from the elements array
      elements = elements.filter(function(el) {
        return element.id !== el.id
      })
      // report duplicates
      if (duplicates.length) {
        offenders = [element.context].concat(duplicates.map(function(dup) {
          return dup.context
        }))
        reporter.warn(
          "duplicate-ids",
          "The id '" + element.id + "' appears more than once in the document.",
          offenders
        )
      }
    }


  })

})

HTMLInspector.rules.add("scoped-styles", function(listener, reporter) {

  var elements = []

  listener.on("element", function(name) {
    var isOutsideHead
      , isScoped
    if (name == "style") {
      isOutsideHead = !$(this).closest("head").length
      isScoped = $(this).attr("scoped") != null
      if (isOutsideHead && !isScoped) {
        reporter.warn(
          "scoped-styles",
          "<style> elements outside of <head> must declare the 'scoped' attribute.",
          this
        )
      }
    }
  })

})

HTMLInspector.rules.add(
  "unique-elements",
  {
    elements: ["title", "main"]
  },
  function(listener, reporter) {

    var map = {}
      , elements = this.elements

    // create the map where the keys are elements that must be unique
    elements.forEach(function(item) {
      map[item] = []
    })

    listener.on("element", function(name) {
      if (elements.indexOf(name) >= 0) {
        map[name].push(this)
      }
    })

    listener.on("afterInspect", function() {
      var offenders
      elements.forEach(function(item) {
        if (map[item].length > 1) {
          reporter.warn(
            "unique-elements",
            "The <" + item + "> element may only appear once in the document.",
            map[item]
          )
        }
      })
    }
  )
})

HTMLInspector.rules.add("validate-attributes", function(listener, reporter) {

  var validation = HTMLInspector.modules.validation

  listener.on("element", function(name) {
    var required = validation.getRequiredAttributesForElement(name)
    required.forEach(function(attr) {
      if ($(this).attr(attr) == null) {
        reporter.warn(
          "validate-attributes",
          "The '" + attr + "' attribute is required for <"
          + name + "> elements.",
          this
        )
      }
    }, this)
  })

  listener.on("attribute", function(name) {
    var element = this.nodeName.toLowerCase()
    if (validation.isAttributeObsoleteForElement(name, element)) {
      reporter.warn(
        "validate-attributes",
        "The '" + name + "' attribute is no longer valid on the <"
        + element + "> element and should not be used.",
        this
      )
    }
    else if (!validation.isAttributeValidForElement(name, element)) {
      reporter.warn(
        "validate-attributes",
        "'" + name + "' is not a valid attribute of the <"
        + element + "> element.",
        this
      )
    }
  })

})

HTMLInspector.rules.add("validate-elements", function(listener, reporter) {

  var validation = HTMLInspector.modules.validation

  listener.on("element", function(name) {
    if (validation.isElementObsolete(name)) {
      reporter.warn(
        "validate-elements",
        "The <" + name + "> element is obsolete and should not be used.",
        this
      )
    }
    else if (!validation.isElementValid(name)) {
      reporter.warn(
        "validate-elements",
        "The <" + name + "> element is not a valid HTML element.",
        this
      )
    }
  })

})