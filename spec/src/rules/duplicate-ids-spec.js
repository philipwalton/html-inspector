describe("duplicate-ids", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when the same ID attribute is used more than once", function() {
    var html = parseHTML(''
          + '<div id="foobar">'
          + '  <p id="foobar">Foo</p>'
          + '  <p id="barfoo">bar <em id="barfoo">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["duplicate-ids"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The id 'foobar' appears more than once in the document.")
    expect(log[1].message).toBe("The id 'barfoo' appears more than once in the document.")
    expect(log[0].context).toEqual([html, html.querySelector("p#foobar")])
    expect(log[1].context).toEqual([html.querySelector("p#barfoo"), html.querySelector("em#barfoo")])

  })

  it("doesn't warn when all ids are unique", function() {
    var html = parseHTML(''
          + '<div id="foobar1">'
          + '  <p id="foobar2">Foo</p>'
          + '  <p id="barfoo1">Bar <em id="barfoo2">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["duplicate-ids"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)
  })

})
