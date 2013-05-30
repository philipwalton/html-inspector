describe("bem-misused-elements", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when a BEM element class is used when not the descendent of a block", function() {
    var $html = $(''
          + '<div class="BlockOne SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-element">three</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["bem-misused-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM element 'BlockTwo-element' must be a descendent of 'BlockTwo'.")
    expect(log[1].message).toBe("The BEM element 'BlockThree-element' must be a descendent of 'BlockThree'.")
    expect(log[0].context).toBe($html.find(".BlockTwo-element")[0])
    expect(log[1].context).toBe($html.find(".BlockThree-element")[0])

  })

  it("doesn't warn when a BEM element class is used as the descendent of a block", function() {
    var $html = $(''
          + '<div class="BlockThree BlockTwo SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-element">three</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["bem-misused-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)
  })

})
