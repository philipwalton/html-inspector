describe("HTML Inspector", function() {





describe("on, off, and trigger", function() {

  afterEach(function() {
    HTMLInspector.removeEvents()
  })

  it("can add handlers to events that are invoked when those events are triggered", function() {
    var count = 0
      , fn = function() {
          count++
        }
    HTMLInspector.on("foo", fn)
    HTMLInspector.on("bar", fn)
    HTMLInspector.trigger("foo")
    HTMLInspector.trigger("bar")
    expect(count).toBe(2)
    HTMLInspector.trigger("foo")
    expect(count).toBe(3)
  })

  it("can remove an event handler", function() {
    var count = 0
      , fn = function() {
          count++
        }
    HTMLInspector.on("foo", fn)
    HTMLInspector.on("bar", fn)
    HTMLInspector.trigger("foo")
    HTMLInspector.trigger("bar")
    expect(count).toBe(2)
    HTMLInspector.trigger("foo")
    expect(count).toBe(3)
    HTMLInspector.off("foo", fn)
    HTMLInspector.off("bar", fn)
    HTMLInspector.trigger("foo")
    HTMLInspector.trigger("bar")
    expect(count).toBe(3)
  })

  it("triggers events with the HTMLInspector object as its context", function() {
    var context
    HTMLInspector.on("foo", function() {
      context = this
    })
    HTMLInspector.trigger("foo")
    expect(context).toBe(HTMLInspector)
  })

  it("can remove all bound events", function() {

  })

})




it("traverses the DOM emitting events as it goes", function() {

})

it("inspects the HTML starting from the domRoot options", function() {

})

it("can add an error to be reported when the inspection is complete", function() {
  var originalRules = HTMLInspector.rules
    , log = []
  HTMLInspector.addRule("error-test", function() {
    this.addError("error-test", "This is the message", document)
  })
  HTMLInspector.inspect({
    rules:["error-test"],
    complete: function(errors) {
      log = errors
    }
  })
  expect(log[0]).toEqual({
    rule: "error-test",
    message: "This is the message",
    context: document
  })
})


it("can add new rules", function() {
  var originalRules = HTMLInspector.rules
  HTMLInspector.addRule("new-rule", $.noop)
  expect(HTMLInspector.rules["new-rule"]).toBeDefined()
  delete HTMLInspector.rules["new-rule"]
})

it("can add new extensions", function() {
  var originalExtensions = HTMLInspector.extensions
  HTMLInspector.addExtension("new-extension", {})
  expect(HTMLInspector.extensions["new-extension"]).toBeDefined()
  delete HTMLInspector.extensions["new-extension"]
})
describe("Extensions", function() {
describe("css", function() {

  var css = HTMLInspector.extensions.css
    , originalStyleSheets = css.styleSheets
    , classes = ["alpha", "bar", "bravo", "charlie", "delta", "echo", "foo"]

  afterEach(function() {
    css.styleSheets = originalStyleSheets
  })

  it("can filter the searched style sheets via the styleSheets selector", function() {
    css.styleSheets = "link[href$='jasmine.css']"
    var classes = css.getClassSelectors()
    // limiting the style sheets to only jasmine.css means
    // .alpha, .bravo, and .charlie won't be there
    expect(classes.indexOf("alpha")).toEqual(-1)
    expect(classes.indexOf("bravo")).toEqual(-1)
    expect(classes.indexOf("charlie")).toEqual(-1)
  })

  it("can get all the class selectors in the style sheets", function() {
    css.styleSheets = "link[href$='-spec.css']"
    expect(css.getClassSelectors()).toEqual(classes)
  })

  it("can include both <link> and <style> elements", function() {
    var extraClasses = classes.concat(["style", "fizz", "buzz"]).sort()
    // first remove any style tags browser extensions might be putting in
    $("style").remove()
    $("head").append(""
      + "<style id='style'>"
      + ".style .foo, .style .bar { visiblility: visible }"
      + ".style .fizz, .style .buzz { visiblility: visible }"
      + "</style>"
    )
    css.styleSheets = "link[href$='-spec.css'], style"
    expect(css.getClassSelectors()).toEqual(extraClasses)
    $("#style").remove()
  })

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