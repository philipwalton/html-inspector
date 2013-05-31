describe("scoped-styles", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when style elements outside of the head do not declare the scoped attribute", function() {
    var $html = $(''
          + '<section>'
          + '  <style> .foo { } </style>'
          + '</section>'
        )

    HTMLInspector.inspect({
      rules: ["scoped-styles"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<style> elements outside of <head> must declare the 'scoped' attribute.")
    expect(log[0].context).toBe($html.find("style")[0])

  })

  it("doesn't warns when style elements outside of the head declare the scoped attribute", function() {
    var $html = $(''
          + '<section>'
          + '  <style scoped> .foo { } </style>'
          + '</section>'
        )

    HTMLInspector.inspect({
      rules: ["scoped-styles"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)

  })

  it("doesn't warns when style elements are inside the head", function() {
    var $html = $(''
          + '<html>'
          + '  <head>'
          + '    <style scoped> .foo { } </style>'
          + '  </head>'
          + '  <body></body>'
          + '</html>'
        )

    HTMLInspector.inspect({
      rules: ["scoped-styles"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)

  })

})
