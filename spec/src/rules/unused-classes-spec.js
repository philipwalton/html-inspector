describe("unused-classes", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when non-whitelisted classes appear in the HTML but not in any stylesheet", function() {
    var html = ''
          + '<div class="fizz buzz">'
          + '  <p class="foo bar baz">This is just a test</p>'
          + '</div>'

    HTMLInspector.inspect({
      rules: ["unused-classes"],
      domRoot: setupSandbox(html),
      complete: complete
    })

    expect(log[0].message).toBe("The class 'fizz' is used in the HTML but not found in any stylesheet")
    expect(log[1].message).toBe("The class 'buzz' is used in the HTML but not found in any stylesheet")
    expect(log[2].message).toBe("The class 'baz' is used in the HTML but not found in any stylesheet")
    expect(log[0].context).toBe($("div.fizz.buzz")[0])
    expect(log[1].context).toBe($("div.fizz.buzz")[0])
    expect(log[2].context).toBe($("p.foo.bar")[0])

  })

  it("doesn't warn when whitelisted classes appear in the HTML", function() {
    var html = ''
          + '<div class="supports-flexbox">'
          + '  <p class="js-alert">This is just a test</p>'
          + '</div>'

    HTMLInspector.inspect({
      rules: ["unused-classes"],
      domRoot: setupSandbox(html),
      complete: complete
    })

    expect(log.length).toBe(0)

  })

})
