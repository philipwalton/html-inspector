describe("required-attributes", function() {

  var log
    , elementMap = [
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

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when elements don't have their required attributes", function() {

    var $html = $(document.createElement("div"))

    elementMap.forEach(function(item) {
      $html.append(document.createElement(item.element))
    })

    HTMLInspector.inspect({
      rules: ["required-attributes"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(elementMap.length)
    elementMap.forEach(function(item, i) {
      expect(log[i].message).toBe("<" + item.element + "> elements must include the following attributes: '" + item.attrs.join("', '") + "'.")
    })

  })

  it("doesn't warn when elements have all their required attributes", function() {

    var $html = $(document.createElement("div"))

    elementMap.forEach(function(item) {
      var $el = $(document.createElement(item.element))
      item.attrs.forEach(function(attr) {
        $el.attr(attr, "")
      })
      $html.append($el)
    })

    HTMLInspector.inspect({
      rules: ["required-attributes"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)

  })
})
