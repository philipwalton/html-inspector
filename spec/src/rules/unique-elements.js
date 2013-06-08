describe("unique-elements", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when single-use elements appear on the page more than once", function() {
    var $html = $(''
          + '<div>'
          + '  <div>'
          + '    <title>Foobar</title>'
          + '  </div>'
          + '  <div>'
          + '    <title>Foobar</title>'
          + '  </div>'
          + '  <header>Page Header</header>'
          + '  <header>Page Header</header>'
          + '  <main>Main content</main>'
          + '  <main>More main content</main>'
          + '  <footer>Footer content</header>'
          + '  <footer>Footer content</header>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["unique-elements"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The <title> element may only appear once in the document.")
    expect(log[1].message).toBe("The <main> element may only appear once in the document.")
    expect(log[0].context).toEqual([$html.find("title")[0], $html.find("title")[1]])
    expect(log[1].context).toEqual([$html.find("main")[0], $html.find("main")[1]])
  })

  it("doesn't warn when single-use elements appear on the page only once", function() {
    var $html = $(''
          + '<html>'
          + '  <head>'
          + '    <title>Foobar</title>'
          + '  </head>'
          + '  <body>'
          + '    <header>Header content</header>'
          + '    <main>Main content</main>'
          + '    <footer>Footer content</header>'
          + '  </body>'
          + '</html>'
        )
    HTMLInspector.inspect({
      useRules: ["unique-elements"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("allows for customization by altering the config object", function() {
    var $html = $(''
          + '<div>'
          + '  <div>'
          + '    <title>Foobar</title>'
          + '  </div>'
          + '  <div>'
          + '    <title>Foobar</title>'
          + '  </div>'
          + '  <header>Page Header</header>'
          + '  <header>Page Header</header>'
          + '  <main>Main content</main>'
          + '  <main>More main content</main>'
          + '  <footer>Footer content</header>'
          + '  <footer>Footer content</header>'
          + '</div>'
        )
    HTMLInspector.rules.extend("unique-elements", {
      elements: ["header", "footer"]
    })
    HTMLInspector.inspect({
      useRules: ["unique-elements"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The <header> element may only appear once in the document.")
    expect(log[1].message).toBe("The <footer> element may only appear once in the document.")
    expect(log[0].context).toEqual([$html.find("header")[0], $html.find("header")[1]])
    expect(log[1].context).toEqual([$html.find("footer")[0], $html.find("footer")[1]])
  })
})