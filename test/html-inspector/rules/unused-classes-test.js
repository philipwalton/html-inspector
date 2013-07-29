describe("unused-classes", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when non-whitelisted classes appear in the HTML but not in any stylesheet", function() {
    var html = parseHTML(''
          + '<div class="fizz buzz">'
          + '  <p class="foo bar baz">This is just a test</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["unused-classes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log[0].message).to.equal("The class 'fizz' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).to.equal("The class 'buzz' is used in the HTML but not found in any stylesheet.")
    expect(log[2].message).to.equal("The class 'baz' is used in the HTML but not found in any stylesheet.")
    expect(log[0].context).to.equal(html)
    expect(log[1].context).to.equal(html)
    expect(log[2].context).to.equal(html.querySelector("p"))

  })

  it("doesn't warn when whitelisted classes appear in the HTML", function() {
    var html = parseHTML(''
          + '<div class="supports-flexbox">'
          + '  <p class="js-alert">This is just a test</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["unused-classes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(0)

  })

  it("allows for customization by altering the config object", function() {

    var html = parseHTML(''
          + '<div class="fizz supports-flexbox">'
          + '  <p class="js-alert buzz">This is just a test</p>'
          + '</div>'
        )

    // the whitelist can be a single RegExp
    HTMLInspector.rules.extend("unused-classes", {whitelist: /fizz|buzz/})

    HTMLInspector.inspect({
      useRules: ["unused-classes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The class 'supports-flexbox' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).to.equal("The class 'js-alert' is used in the HTML but not found in any stylesheet.")

    log = []
    // It can also be a list of strings or RegExps
    HTMLInspector.rules.extend("unused-classes", {whitelist: ["fizz", /buz\w/]})

    HTMLInspector.inspect({
      useRules: ["unused-classes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The class 'supports-flexbox' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).to.equal("The class 'js-alert' is used in the HTML but not found in any stylesheet.")

  })

})
