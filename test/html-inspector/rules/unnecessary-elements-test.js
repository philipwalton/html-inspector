describe("unnecessary-elements", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when unattributed <div> or <span> elements appear in the HTML", function() {
    var html = parseHTML(''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["unnecessary-elements"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(3)
    expect(log[0].message).to.equal("Do not use <div> or <span> elements without any attributes.")
    expect(log[1].message).to.equal("Do not use <div> or <span> elements without any attributes.")
    expect(log[2].message).to.equal("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).to.equal(html)
    expect(log[1].context).to.equal(html.querySelector("span"))
    expect(log[2].context).to.equal(html.querySelector("div"))

  })

  it("doesn't warn when attributed <div> or <span> elements appear in the HTML", function() {
    var html = parseHTML(''
          + '<div data-foo="bar">'
          + '  <span class="alert">Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["unnecessary-elements"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(1)
    expect(log[0].message).to.equal("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).to.equal(html.querySelector("div"))

  })

  it("doesn't warn when unattributed, semantic elements appear in the HTML", function() {
    var html = parseHTML(''
          + '<section data-foo="bar">'
          + '  <h1>Foo</h1>'
          + '  <p>Foo</p>'
          + '</section>'
        )

    HTMLInspector.inspect({
      useRules: ["unnecessary-elements"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(0)

  })

  it("allows for customization by altering the config object", function() {
    var html = parseHTML(''
          + '<div>'
          + '  <h1>Foo</h1>'
          + '  <span>Foo</span>'
          + '</div>'
        )
    HTMLInspector.rules.extend("unnecessary-elements", {
      isUnnecessary: function(element) {
        return element.nodeName === "SPAN"
      }
    })
    HTMLInspector.inspect({
      useRules: ["unnecessary-elements"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(1)
    expect(log[0].context).to.equal(html.querySelector("span"))

  })

})
