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

    expect(log.length).to.equal(6)
    expect(log[0].message).to.equal("The <p> element cannot be a child of the <h1> element.")
    expect(log[0].context).to.equal(html.querySelector("h1 > p"))
    expect(log[1].message).to.equal("The <ul> element cannot be a child of the <span> element.")
    expect(log[1].context).to.equal(html.querySelector("span > ul"))
    expect(log[2].message).to.equal("The <span> element cannot be a child of the <ul> element.")
    expect(log[2].context).to.equal(html.querySelector("ul > span"))
    expect(log[3].message).to.equal("The <li> element cannot be a child of the <span> element.")
    expect(log[3].context).to.equal(html.querySelector("span > li"))
    expect(log[4].message).to.equal("The <title> element cannot be a child of the <p> element.")
    expect(log[4].context).to.equal(html.querySelector("p > title"))
    expect(log[5].message).to.equal("The <p> element cannot be a child of the <em> element.")
    expect(log[5].context).to.equal(html.querySelector("em > p"))
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
    expect(log.length).to.equal(0)
  })

  it("warns when <style> elements inside body do not declare the scoped attribute", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><style> .foo { } </style></section>'

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(1)
    expect(log[0].message).to.equal("<style> elements inside <body> must contain the 'scoped' attribute.")
    expect(log[0].context).to.equal(html.querySelector("style"))
  })

  it("doesn't warns when <style> elements are inside the head", function() {
    var html = parseHTML(''
          + '<html>'
          + '  <head>'
          + '    <style scoped> .foo { } </style>'
          + '  </head>'
          + '  <body></body>'
          + '</html>'
        )
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(0)
  })

  it("warns when <style> elements inside body declare the scoped attribute but are not the first child of their parent", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><span>alert</span><style scoped> .foo { } </style></section>'

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(1)
    expect(log[0].message).to.equal("Scoped <style> elements must be the first child of their parent element.")
    expect(log[0].context).to.equal(html.querySelector("style"))
  })

  it("doesn't warns when <style scoped> elements are the first child of their parent", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><style scoped> .foo { } </style></section>'
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(0)
  })

  it("warns when <link> and <meta> elements inside body do not declare the itemprop attribute", function() {
    var html = document.createElement("body")
    html.innerHTML = '<meta charset="utf-8"><link rel="imports" href="component.html">'
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("<meta> elements inside <body> must contain the 'itemprop' attribute.")
    expect(log[0].context).to.equal(html.querySelector("meta"))
    expect(log[1].message).to.equal("<link> elements inside <body> must contain the 'itemprop' attribute.")
    expect(log[1].context).to.equal(html.querySelector("link"))
  })

  it("doesn't warns when <link> and <meta> elements are inside the head", function() {
    var html = parseHTML(''
          + '<html>'
          + '  <head>'
          + '    <meta charset="utf-8">'
          + '    <link rel="imports" href="component.html">'
          + '  </head>'
          + '  <body></body>'
          + '</html>'
        )
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(0)
  })

  it("allows for customization by altering the config object", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <style scoped> .foo { } </style>'
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

    // whitelist foobar
    HTMLInspector.rules.extend("validate-element-location", {
      whitelist: [":not(p)"]
    })

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The <p> element cannot be a child of the <h1> element.")
    expect(log[0].context).to.equal(html.querySelector("h1 > p"))
    expect(log[1].message).to.equal("The <p> element cannot be a child of the <em> element.")
    expect(log[1].context).to.equal(html.querySelector("em > p"))
  })

})