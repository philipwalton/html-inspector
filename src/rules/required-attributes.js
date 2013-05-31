HTMLInspector.addRule("required-attributes", function(listener, reporter) {

  // http://www.w3.org/TR/html4/index/attributes.html
  // http://www.w3.org/TR/html5-diff/#changed-attributes
  var elementMap = [
        { element: "area", attrs: ["alt"] },
        { element: "applet", attrs: ["height", "width"] },
        { element: "bdo", attrs: ["dir"] },
        { element: "form", attrs: ["action"] },
        { element: "img", attrs: ["alt", "src"] },
        { element: "map", attrs: ["name"] },
        { element: "optgroup", attrs: ["label"] },
        { element: "param", attrs: ["name"] },
        { element: "textarea", attrs: ["cols", "rows"] }
      ]

  listener.on("element", function(name) {

    var el = this

    elementMap.forEach(function(item) {

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