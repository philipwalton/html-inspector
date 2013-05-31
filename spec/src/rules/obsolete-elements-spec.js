describe("obsolete-elements", function() {

  var log
    , obsoluteElements = [
        "basefont",
        "big",
        "center",
        "font",
        "strike",
        "tt",
        "frame",
        "frameset",
        "noframes",
        "acronym",
        "applet",
        "isindex",
        "dir"
      ]

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when obsolete elements appear in the HTML", function() {
    var $html = $(document.createElement("div"))

    obsoluteElements.forEach(function(el) {
      $html.append(document.createElement(el))
    })

    HTMLInspector.inspect({
      rules: ["obsolete-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(obsoluteElements.length)
    obsoluteElements.forEach(function(el, i) {
      expect(log[i].message).toBe("The <" + el + "> element is obsolete and should not be used.")
      expect(log[i].context).toBe($html.find(el)[0])
    })

  })

  it("doesn't warn when non-obsolete elements are used", function() {

    var $html = $(''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["obsolete-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)

  })

})
