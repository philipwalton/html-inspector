describe("validate-attributes", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when obsolete attributes of elements appear in the HTML", function() {

    var html = parseHTML(''
          + '<div align="center">'
          + '  <section>'
          + '     <h1>Title</h1>'
          + '     <h2 align="right">Subtitle</h2>'
          + '     <p>foo <br clear="both"> bar</p>'
          + '  </section>'
          + '  <hr color="red">'
          + '  <ul type="foo">'
          + '    <li>blah</li>'
          + '  </ul>'
          + '  <ol type="1">'
          + '    <li>blah</li>'
          + '  </ol>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(5)
    expect(log[0].message).to.equal("The 'align' attribute is no longer valid on the <div> element and should not be used.")
    expect(log[0].context).to.equal(html)
    expect(log[1].message).to.equal("The 'align' attribute is no longer valid on the <h2> element and should not be used.")
    expect(log[1].context).to.equal(html.querySelector("h2"))
    expect(log[2].message).to.equal("The 'clear' attribute is no longer valid on the <br> element and should not be used.")
    expect(log[2].context).to.equal(html.querySelector("br"))
    expect(log[3].message).to.equal("The 'color' attribute is no longer valid on the <hr> element and should not be used.")
    expect(log[3].context).to.equal(html.querySelector("hr"))
    expect(log[4].message).to.equal("The 'type' attribute is no longer valid on the <ul> element and should not be used.")
    expect(log[4].context).to.equal(html.querySelector("ul"))

  })

  it("warns when invalid attributes of elements appear in the HTML", function() {

    var html = parseHTML(''
          + '<div foo="bar">'
          + '  <section action="http://example.com">'
          + '     <h1>Title</h1>'
          + '     <h2 cell-padding="1">Subtitle</h2>'
          + '     <p>foo <br blah="true"> bar</p>'
          + '  </section>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(4)
    expect(log[0].message).to.equal("'foo' is not a valid attribute of the <div> element.")
    expect(log[0].context).to.equal(html)
    expect(log[1].message).to.equal("'action' is not a valid attribute of the <section> element.")
    expect(log[1].context).to.equal(html.querySelector("section"))
    expect(log[2].message).to.equal("'cell-padding' is not a valid attribute of the <h2> element.")
    expect(log[2].context).to.equal(html.querySelector("h2"))
    expect(log[3].message).to.equal("'blah' is not a valid attribute of the <br> element.")
    expect(log[3].context).to.equal(html.querySelector("br"))

  })

  it("warns when required attributes are missing", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <img class="foo" />'
          + '  <form>'
          + '     <textarea><textarea>'
          + '  </form>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(5)
    expect(log[0].message).to.equal("The 'alt' attribute is required for <img> elements.")
    expect(log[0].context).to.equal(html.querySelector("img"))
    expect(log[1].message).to.equal("The 'src' attribute is required for <img> elements.")
    expect(log[1].context).to.equal(html.querySelector("img"))
    expect(log[2].message).to.equal("The 'action' attribute is required for <form> elements.")
    expect(log[2].context).to.equal(html.querySelector("form"))
    expect(log[3].message).to.equal("The 'cols' attribute is required for <textarea> elements.")
    expect(log[3].context).to.equal(html.querySelector("textarea"))
    expect(log[4].message).to.equal("The 'rows' attribute is required for <textarea> elements.")
    expect(log[4].context).to.equal(html.querySelector("textarea"))

  })

  it("doesn't double-warn when an attribute is both invalid and obsolete", function() {

    var html = parseHTML(''
          + '<div align="center">'
          + '   <h1>Title</h1>'
          + '   <h2>Subtitle</h2>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(1)
  })

  it("doesn't warn about invalid attributes if the element containing the attribute is invalid", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <foo bar></foo>'
          + '  <fizz buzz="true"></fizz>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(0)
  })

  it("doesn't warn when valid, non-obsolete elements are used", function() {

    var html = parseHTML(''
          + '<div class="foo" data-foo="bar" role="main">'
          + '  <span id="bar">Foo</span>'
          + '  <a aria-foo="bar" href="#">Foo</a>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(0)

  })


})