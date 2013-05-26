describe("HTML Inspector", function() {





describe("stylesheets", function() {

  var originalFilter = HTMLInspector.styleSheets.filter
    , classes = ["alpha", "bar", "bravo", "charlie", "delta", "echo", "foo"]

  afterEach(function() {
    HTMLInspector.styleSheets.filter = originalFilter
  })

  it("adds the styleSheets object as a property on HTMLInspector", function() {
    expect(HTMLInspector.styleSheets).toBeDefined()
  })

  it("can filter the searched style sheets via the filter option", function() {
    HTMLInspector.styleSheets.filter = "link[href$='jasmine.css']"
    // limiting the style sheets to only jasmine.css means
    // .alpha, .bravo, and .charlie won't be there
    var classes = HTMLInspector.styleSheets.getClassSelectors()
    expect(classes.indexOf("alpha")).toEqual(-1)
    expect(classes.indexOf("bravo")).toEqual(-1)
    expect(classes.indexOf("charlie")).toEqual(-1)
  })

  it("can get all the class selectors in the style sheets", function() {
    HTMLInspector.styleSheets.filter = "link[href$='-spec.css']"
    expect(HTMLInspector.styleSheets.getClassSelectors()).toEqual(classes)
  })

  it("can include both <link> and <style> elements", function() {
    var extraClasses = classes.concat(["style", "fizz", "buzz"]).sort()
    $("head").append(""
      + "<style id='style'>"
      + ".style .foo, .style .bar { visiblility: visible }"
      + ".style .fizz, .style .buzz { visiblility: visible }"
      + "</style>"
    )
    HTMLInspector.styleSheets.filter = "link[href$='-spec.css'], style"
    expect(HTMLInspector.styleSheets.getClassSelectors()).toEqual(extraClasses)
    $("#style").remove()
  })

})

describe("Rules", function() {

  var originalConfig = HTMLInspector.config

  function setupSandbox(html) {
    return  $("#html-inspector-sandbox").html(html)
  }

  beforeEach(function() {
    // HTMLInspector.config.styleSheets = $("link:not([href*='jasmine'])")
    $('<div id="html-inspector-sandbox"></div>').appendTo("body")
  })

  afterEach(function() {
    // HTMLInspector.config = originalConfig
    $("#html-inspector-sandbox").remove()
  })

describe("nonsemantic-elements", function() {

  var log
    , $sandbox

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when unattributed <div> or <span> elements appear in the HTML", function() {
    var html = ''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $sandbox = setupSandbox(html),
      complete: complete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("Do not use <div> or <span> elements without any attributes")
    expect(log[1].message).toBe("Do not use <div> or <span> elements without any attributes")
    expect(log[2].message).toBe("Do not use <div> or <span> elements without any attributes")
    expect(log[0].context).toBe($sandbox.find("div")[0])
    expect(log[1].context).toBe($sandbox.find("span")[0])
    expect(log[2].context).toBe($sandbox.find("div")[1])

  })

  it("doesn't warn when attributed <div> or <span> elements appear in the HTML", function() {
    var html = ''
          + '<div data-foo="bar">'
          + '  <span class="alert">Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $sandbox = setupSandbox(html),
      complete: complete
    })

    expect(log.length).toBe(1)
    expect(log[0].message).toBe("Do not use <div> or <span> elements without any attributes")
    expect(log[0].context).toBe($sandbox.find("div").last()[0])

  })

  it("doesn't warn when unattributed, semantic elements appear in the HTML", function() {
    var html = ''
          + '<section data-foo="bar">'
          + '  <h1>Foo</h1>'
          + '  <p>Foo</p>'
          + '</section>'

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $sandbox = setupSandbox(html),
      complete: complete
    })

    expect(log.length).toBe(0)

  })

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

})

})