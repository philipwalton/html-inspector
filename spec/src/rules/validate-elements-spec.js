describe("validate-elements", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when obsolete elements appear in the HTML", function() {

    var $html = $(''
          + '<div>'
          + '  <hgroup>'
          + '     <h1>Title</h1>'
          + '     <h2>Subtitle</h2>'
          + '  </hgroup>'
          + '  <tt>Teletype text</tt>'
          + '  <center><p><b>Foo</b></p></center>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The <hgroup> element is obsolete and should not be used.")
    expect(log[0].context).toBe($html.find("hgroup")[0])
    expect(log[1].message).toBe("The <tt> element is obsolete and should not be used.")
    expect(log[1].context).toBe($html.find("tt")[0])
    expect(log[2].message).toBe("The <center> element is obsolete and should not be used.")
    expect(log[2].context).toBe($html.find("center")[0])

  })

  it("warns when invalid elements appear in the HTML", function() {

    var $html = $(''
          + '<div>'
          + '  <foo>'
          + '     <h1>Title</h1>'
          + '     <h2>Subtitle</h2>'
          + '  </foo>'
          + '  <bar>Teletype text</bar>'
          + '  <bogus><p><b>Foo</b></p></bogus>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The <foo> element is not a valid HTML element.")
    expect(log[0].context).toBe($html.find("foo")[0])
    expect(log[1].message).toBe("The <bar> element is not a valid HTML element.")
    expect(log[1].context).toBe($html.find("bar")[0])
    expect(log[2].message).toBe("The <bogus> element is not a valid HTML element.")
    expect(log[2].context).toBe($html.find("bogus")[0])

  })

  it("doesn't double-warn when an element is both invalid and obsolete", function() {

    var $html = $(''
          + '<hgroup>'
          + '   <h1>Title</h1>'
          + '   <h2>Subtitle</h2>'
          + '</hgroup>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(1)
  })

  it("doesn't warn when valid, non-obsolete elements are used", function() {

    var $html = $(''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

  })

})