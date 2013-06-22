describe("validate-element-location", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when elements appear as children of parent elements they're not allow to be within", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <h1>This is a <p>Heading!</p> shit</h1>'
          + '  <span>'
          + '    <ul>'
          + '      <li>foo</li>'
          + '    </ul>'
          + '  </span>'
          + '  <ul>'
          + '    <span><li>Foo</li></span>'
          + '    <li>Bar</li>'
          + '  </ul>'
          + '  <p>This is a <title>title</title> element</p>'
          + '  <em><p>emphasize!</p></em>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(6)
    expect(log[0].message).toBe("The <p> element cannot be a child of the <h1> element.")
    expect(log[0].context).toBe(html.querySelector("h1 > p"))
    expect(log[1].message).toBe("The <ul> element cannot be a child of the <span> element.")
    expect(log[1].context).toBe(html.querySelector("span > ul"))
    expect(log[2].message).toBe("The <span> element cannot be a child of the <ul> element.")
    expect(log[2].context).toBe(html.querySelector("ul > span"))
    expect(log[3].message).toBe("The <li> element cannot be a child of the <span> element.")
    expect(log[3].context).toBe(html.querySelector("span > li"))
    expect(log[4].message).toBe("The <title> element cannot be a child of the <p> element.")
    expect(log[4].context).toBe(html.querySelector("p > title"))
    expect(log[5].message).toBe("The <p> element cannot be a child of the <em> element.")
    expect(log[5].context).toBe(html.querySelector("em > p"))
  })


  it("doesn't warn when elements appear as children of parents they're allowed to be within", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <h1>This is a <strong>Heading!</strong> shit</h1>'
          + '  <p><a href="#"><span></span></a><p>'
          + '  <ol><li><p>li</p></li></ol>'
          + '  <section>'
          + '    <article><h1>Blah</h1><p>This is some text</p></article>'
          + '  </section>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

  })

})