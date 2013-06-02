describe("duplicate-ids", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when the same ID attribute is used more than once", function() {
    var $html = $(''
          + '<div id="foobar">'
          + '  <p id="foobar">Foo</p>'
          + '  <p id="barfoo">Bar <em id="barfoo">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["duplicate-ids"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The id 'foobar' appears more than once in the document.")
    expect(log[1].message).toBe("The id 'barfoo' appears more than once in the document.")
    expect(log[0].context).toEqual([$html[0], $html.find("p#foobar")[0]])
    expect(log[1].context).toEqual([$html.find("p#barfoo")[0], $html.find("em#barfoo")[0]])

  })

  it("doesn't warn when all ids are unique", function() {
    var $html = $(''
          + '<div id="foobar1">'
          + '  <p id="foobar2">Foo</p>'
          + '  <p id="barfoo1">Bar <em id="barfoo2">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["duplicate-ids"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)
  })

})
