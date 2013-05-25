describe("HTML Inspector", function() {





describe("Rules", function() {

  var originalConfig = HTMLInspector.config

  function setupSandbox(html) {
    return  $("#html-inspector-sandbox").html(html)
  }

  beforeEach(function() {
    HTMLInspector.config.styleSheets = $("link:not([href*='jasmine'])")
    $('<div id="html-inspector-sandbox"></div>').appendTo("body")
  })

  afterEach(function() {
    HTMLInspector.config = originalConfig
    $("#html-inspector-sandbox").remove()
  })

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
      domRoot: setupSandbox(html),
      complete: complete
    })

    expect(log.length).toBe(0)

  })

})

})

})