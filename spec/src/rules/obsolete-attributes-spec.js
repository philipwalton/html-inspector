describe("obsolete-attributes", function() {

  var log
    , obsoluteAttributes = HTMLInspector.extensions.attributes.obsoluteAttributes

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when obsolete element attributes appear in the HTML", function() {
    var $html = $(document.createElement("div"))
      , count = 0
    obsoluteAttributes.forEach(function(item) {
      item.elements.forEach(function(element) {
        var $el = $(document.createElement(element))
        item.attrs.forEach(function(attr) {
          count++
          $el.attr(attr, "")
        })
        $html.append($el)
      })
    })

    HTMLInspector.inspect({
      rules: ["obsolete-attributes"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(count)

    count = 0
    obsoluteAttributes.forEach(function(item) {
      item.elements.forEach(function(element) {
        item.attrs.forEach(function(attr) {
          expect(log[count].message).toBe("The '" + attr + "' attribute of the <" + element + "> element is obsolete and should not be used.")
          expect(log[count].context).toBe($html.find(element + "["+attr+"]")[0])
          count++
        })
      })
    })

  })

  it("doesn't warn when non-obsolete element attributes are used", function() {

    var $html = $(''
          + '<div class="foo">'
          + '  <span id="bar">Foo</span>'
          + '  <p title="p">Foo</p>'
          + '  <div data-foo-bar><b style="display:none;">Foo</b></div>'
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
