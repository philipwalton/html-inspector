describe("nonsemantic-elements", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when unattributed <div> or <span> elements appear in the HTML", function() {
    var $html = $(''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[1].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[2].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].context).toBe($html.find("span")[0])
    expect(log[2].context).toBe($html.find("div")[0])

  })

  it("doesn't warn when attributed <div> or <span> elements appear in the HTML", function() {
    var $html = $(''
          + '<div data-foo="bar">'
          + '  <span class="alert">Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(1)
    expect(log[0].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).toBe($html.find("div")[0])

  })

  it("doesn't warn when unattributed, semantic elements appear in the HTML", function() {
    var $html = $(''
          + '<section data-foo="bar">'
          + '  <h1>Foo</h1>'
          + '  <p>Foo</p>'
          + '</section>'
        )

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)

  })

})
