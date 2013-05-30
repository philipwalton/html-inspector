describe("bem-misused-modifiers", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when a BEM modifier class is used without the base block class", function() {
    var $html = $(''
          + '<div class="BlockOne--active">'
          + '  <p class="BlockTwo--valid BlockThree SomeOtherBlock">Foo</p>'
          + '  <p>Bar</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["bem-misused-modifiers"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM modifier class 'BlockOne--active' was found without the block base class 'BlockOne'.")
    expect(log[1].message).toBe("The BEM modifier class 'BlockTwo--valid' was found without the block base class 'BlockTwo'.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].context).toBe($html.find(".BlockTwo--valid")[0])

  })

  it("doesn't warn when a BEM modifier is used with a base block class", function() {
    var $html = $(''
          + '<div class="BlockOne BlockOne--active">'
          + '  <p class="BlockTwo BlockTwo--valid SomeOtherBlock">Foo</p>'
          + '  <p>Bar</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["bem-misused-modifiers"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)
  })

})
