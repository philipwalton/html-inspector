describe("HTMLInspector", function() {

  var originalRules = HTMLInspector.rules
    , originalExtensions = HTMLInspector.extensions

  beforeEach(function() {
    HTMLInspector.rules = {}
  })

  afterEach(function() {
    HTMLInspector.rules = originalRules
    HTMLInspector.extensions = originalExtensions
  })

  it("can add new rules", function() {
    HTMLInspector.addRule("new-rule", $.noop)
    expect(HTMLInspector.rules["new-rule"]).toBeDefined()
  })

  it("can add new extensions", function() {
    HTMLInspector.addExtension("new-extension", {})
    expect(HTMLInspector.extensions["new-extension"]).toBeDefined()
  })

  it("only runs the specified rules (or all rules if none are specified)", function() {
    var rules = []
    HTMLInspector.addRule("one", function(listener, reporter) {
      listener.on("beforeInspect", function(name) { rules.push("one") })
    })
    HTMLInspector.addRule("two", function(listener, reporter) {
      listener.on("beforeInspect", function(name) { rules.push("two") })
    })
    HTMLInspector.addRule("three", function(listener, reporter) {
      listener.on("beforeInspect", function(name) { rules.push("three") })
    })
    HTMLInspector.inspect()
    expect(rules.length).toBe(3)
    expect(rules[0]).toBe("one")
    expect(rules[1]).toBe("two")
    expect(rules[2]).toBe("three")
    rules = []
    HTMLInspector.inspect({rules: ["one"]})
    expect(rules.length).toBe(1)
    expect(rules[0]).toBe("one")
    rules = []
    HTMLInspector.inspect({rules: ["one", "two"]})
    expect(rules.length).toBe(2)
    expect(rules[0]).toBe("one")
    expect(rules[1]).toBe("two")
  })

  it("invokes the complete callback passing in an array of errors", function() {
    var log
    HTMLInspector.addRule("one-two", function(listener, reporter) {
      reporter.addError("one-two", "This is the `one` error message", document)
      reporter.addError("one-two", "This is the `two` error message", document)

    })
    HTMLInspector.addRule("three", function(listener, reporter) {
      reporter.addError("three", "This is the `three` error message", document)
    })
    HTMLInspector.inspect({
      complete: function(errors) {
        log = errors
      }
    })
    expect(log.length).toBe(3)
    expect(log[0].message).toBe("This is the `one` error message")
    expect(log[1].message).toBe("This is the `two` error message")
    expect(log[2].message).toBe("This is the `three` error message")
  })

  it("accepts a variety of options for the config paramter", function() {
    var log = []
      , div = document.createElement("div")
    HTMLInspector.addRule("dom", function(listener, reporter) {
      listener.on("element", function(name) {
        log.push(this)
      })
    })
    HTMLInspector.addRule("rules", function() {
      log.push("rules")
    })
    // if it's an array, assume it's a list of rules
    HTMLInspector.inspect(["dom"])
    expect(log[0]).not.toBe("rules")
    log = []
    // if it's a string, assume it's a selector or HTML representing domRoot
    HTMLInspector.inspect("body")
    expect(log[1]).toBe($("body")[0])
    log = []
    HTMLInspector.inspect("<p>foobar</p>")
    expect(log[1].innerHTML).toBe("foobar")
    log = []
    // if it's a DOM element, assume it's the domRoot
    HTMLInspector.inspect(div)
    expect(log[1]).toBe(div)
    log = []
    // if it's jQuery, assume it's the domRoot
    HTMLInspector.inspect($(div))
    expect(log[1]).toBe(div)
    log = []
    // if it's a function, assume it's complete
    HTMLInspector.inspect(function(errors) {
      log = "func"
    })
    expect(log).toBe("func")
  })

  describe("DOM Traversal and Events", function() {

    var $html = $(''
          + '<section class="section">'
          + '  <h1 id="heading" class="multiple classes">Heading</h1>'
          + '  <p class="first">One</p>'
          + '  <p><a href="#">More</a></p>'
          + '  <blockquote data-foo="bar" onclick="somefunc()">'
          + '    <p style="display: inline;">Nested</p>'
          + '    <p class="stuff">Stuff'
          + '      <em id="emphasis" data-bar="foo">lolz</em>'
          + '    </p>'
          + '  </blockquote>'
          + '</section>'
        )

    it("inspects the HTML starting from the specified domRoot", function() {
      var events = []
      HTMLInspector.addRule("traverse-test", function(listener, reporter) {
        listener.on("element", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect()
      expect(events[0]).toBe("html")
      events = []
      HTMLInspector.inspect({ domRoot: $html })
      expect(events[0]).toBe("section")
    })

    it("triggers `beforeInspect` before the DOM traversal", function() {
      var events = []
      HTMLInspector.addRule("traverse-test", function(listener, reporter) {
        listener.on("beforeInspect", function() {
          events.push("beforeInspect")
        })
        listener.on("element", function() {
          events.push("element")
        })
      })
      HTMLInspector.inspect($html)
      expect(events.length).toBeGreaterThan(2)
      expect(events[0]).toBe("beforeInspect")
      expect(events[1]).toBe("element")
    })

    it("traverses the DOM emitting events for each element", function() {
      var events = []
      HTMLInspector.addRule("traverse-test", function(listener, reporter) {
        listener.on("element", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect($html)
      expect(events.length).toBe(9)
      expect(events[0]).toBe("section")
      expect(events[1]).toBe("h1")
      expect(events[2]).toBe("p")
      expect(events[3]).toBe("p")
      expect(events[4]).toBe("a")
      expect(events[5]).toBe("blockquote")
      expect(events[6]).toBe("p")
      expect(events[7]).toBe("p")
      expect(events[8]).toBe("em")
    })

    it("traverses the DOM emitting events for each id attribute", function() {
      var events = []
      HTMLInspector.addRule("traverse-test", function(listener, reporter) {
        listener.on("id", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect($html)
      expect(events.length).toBe(2)
      expect(events[0]).toBe("heading")
      expect(events[1]).toBe("emphasis")
    })

    it("traverses the DOM emitting events for each class attribute", function() {
      var events = []
      HTMLInspector.addRule("traverse-test", function(listener, reporter) {
        listener.on("class", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect($html)
      expect(events.length).toBe(5)
      expect(events[0]).toBe("section")
      expect(events[1]).toBe("multiple")
      expect(events[2]).toBe("classes")
      expect(events[3]).toBe("first")
      expect(events[4]).toBe("stuff")
    })

    it("traverses the DOM emitting events for each attribute", function() {
      var events = []
      HTMLInspector.addRule("traverse-test", function(listener, reporter) {
        listener.on("attribute", function(name, value) {
          events.push({name:name, value:value})
        })
      })
      HTMLInspector.inspect($html)
      expect(events.length).toBe(11)
      expect(events[0]).toEqual({name:"class", value:"section"})
      expect(events[1]).toEqual({name:"id", value:"heading"})
      expect(events[2]).toEqual({name:"class", value:"multiple classes"})
      expect(events[3]).toEqual({name:"class", value:"first"})
      expect(events[4]).toEqual({name:"href", value:"#"})
      expect(events[5]).toEqual({name:"data-foo", value:"bar"})
      expect(events[6]).toEqual({name:"onclick", value:"somefunc()"})
      expect(events[7]).toEqual({name:"style", value:"display: inline;"})
      expect(events[8]).toEqual({name:"class", value:"stuff"})
      expect(events[9]).toEqual({name:"id", value:"emphasis"})
      expect(events[10]).toEqual({name:"data-bar", value:"foo"})
    })

    it("triggers `afterInspect` after the DOM traversal", function() {
      var events = []
      HTMLInspector.addRule("traverse-test", function(listener, reporter) {
        listener.on("afterInspect", function() {
          events.push("afterInspect")
        })
        listener.on("element", function() {
          events.push("element")
        })
      })
      HTMLInspector.inspect($html)
      expect(events.length).toBeGreaterThan(2)
      expect(events[events.length - 1]).toBe("afterInspect")
    })

  })

})
describe("Listener", function() {

  var Listener = getListenerConstructor()

  function getListenerConstructor() {
    var Listener
      , originalRules = HTMLInspector.rules
    HTMLInspector.addRule("listener", function(listener) {
      Listener = listener.constructor
    })
    HTMLInspector.inspect({
      rules: ["listener"],
      domRoot: document.createElement("div")
    })
    HTMLInspector.rules = originalRules
    return Listener
  }


  it("can add handlers to a specific event", function() {
    var listener = new Listener()
    listener.on("foo", $.noop)
    listener.on("bar", $.noop)
    expect(listener._events.foo).toBeDefined()
    expect(listener._events.bar).toBeDefined()
  })

  it("can trigger handlers on a specific event", function() {
    var listener = new Listener()
    spyOn($, "noop")
    listener.on("foo", $.noop)
    listener.on("bar", $.noop)
    listener.trigger("foo")
    listener.trigger("bar")
    expect($.noop.callCount).toBe(2)
  })

  it("can remove handlers from a specific event", function() {
    var listener = new Listener()
    spyOn($, "noop")
    listener.on("foo", $.noop)
    listener.on("bar", $.noop)
    listener.off("foo", $.noop)
    listener.off("bar", $.noop)
    listener.trigger("foo")
    listener.trigger("bar")
    expect($.noop.callCount).toBe(0)
  })

})
describe("Reporter", function() {

  var Reporter = getReporterConstructor()

  function getReporterConstructor() {
    var Reporter
      , originalRules = HTMLInspector.rules
    HTMLInspector.addRule("reporter", function(reporter, reporter) {
      Reporter = reporter.constructor
    })
    HTMLInspector.inspect({
      rules: ["reporter"],
      domRoot: document.createElement("div")
    })
    HTMLInspector.rules = originalRules
    return Reporter
  }

  it("can add an error to the report log", function() {
    var reporter = new Reporter()
    reporter.addError("rule-name", "This is the message", document)
    expect(reporter._errors.length).toBe(1)
    expect(reporter._errors[0].rule).toBe("rule-name")
    expect(reporter._errors[0].message).toBe("This is the message")
    expect(reporter._errors[0].context).toBe(document)
  })

  it("can get all the errors that have been logged", function() {
    var reporter = new Reporter()
    reporter.addError("rule-name", "This is the first message", document)
    reporter.addError("rule-name", "This is the second message", document)
    reporter.addError("rule-name", "This is the third message", document)
    expect(reporter.getErrors().length).toBe(3)
    expect(reporter.getErrors()[0].message).toBe("This is the first message")
    expect(reporter.getErrors()[1].message).toBe("This is the second message")
    expect(reporter.getErrors()[2].message).toBe("This is the third message")
  })

})
describe("Extensions", function() {
describe("bem", function() {

  var bem = HTMLInspector.extensions.bem

  it("can take a BEM modifier or element class and returns its block's class name", function() {
    expect(bem.getBlockName("Block--modifier")).toBe("Block")
    expect(bem.getBlockName("BlockName--someModifier")).toBe("BlockName")
    expect(bem.getBlockName("Block-element")).toBe("Block")
    expect(bem.getBlockName("BlockName-subElement")).toBe("BlockName")
    expect(bem.getBlockName("BlockName")).toBe(false)
    expect(bem.getBlockName("Foo---bar")).toBe(false)
    expect(bem.getBlockName("Foo--bar--baz")).toBe(false)
  })

  it("can determine if a class is a block modifier class", function() {
    expect(bem.isBlockModifier("Block--modifier")).toBe(true)
    expect(bem.isBlockModifier("BlockName--modifierName")).toBe(true)
    expect(bem.isBlockModifier("Block-element")).toBe(false)
    expect(bem.isBlockModifier("BlockName-elementName")).toBe(false)
    expect(bem.isBlockModifier("Block--modifier-stuffz")).toBe(false)
    expect(bem.isBlockModifier("Block--modifier--stuffz")).toBe(false)
  })

  it("can determine if a class is a block element class", function() {
    expect(bem.isBlockElement("Block-element")).toBe(true)
    expect(bem.isBlockElement("BlockName-elementName")).toBe(true)
    expect(bem.isBlockElement("Block--modifier")).toBe(false)
    expect(bem.isBlockElement("BlockName--modifierName")).toBe(false)
    expect(bem.isBlockElement("Block--modifier-stuffz")).toBe(false)
    expect(bem.isBlockElement("Block--modifier--stuffz")).toBe(false)
  })

})
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
describe("bem-misused-elements", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when a BEM element class is used when not the descendent of a block", function() {
    var $html = $(''
          + '<div class="BlockOne SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-element">three</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["bem-misused-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM element 'BlockTwo-element' must be a descendent of 'BlockTwo'.")
    expect(log[1].message).toBe("The BEM element 'BlockThree-element' must be a descendent of 'BlockThree'.")
    expect(log[0].context).toBe($html.find(".BlockTwo-element")[0])
    expect(log[1].context).toBe($html.find(".BlockThree-element")[0])

  })

  it("doesn't warn when a BEM element class is used as the descendent of a block", function() {
    var $html = $(''
          + '<div class="BlockThree BlockTwo SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-element">three</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["bem-misused-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)
  })

})

describe("bem-misused-modifiers", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when a BEM modifier class is used without the base block class", function() {
    var $html = $(''
          + '<div class="BlockOne--active">'
          + '  <p class="BlockTwo--valid BlockThree SomeOtherBlock">Foo</p>'
          + '  <p>Bar</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["bem-misused-modifiers"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM modifier class 'BlockOne--active' was found without the block base class 'BlockOne'.")
    expect(log[1].message).toBe("The BEM modifier class 'BlockTwo--valid' was found without the block base class 'BlockTwo'.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].context).toBe($html.find(".BlockTwo--valid")[0])

  })

  it("doesn't warn when a BEM modifier is used with a base block class", function() {
    var $html = $(''
          + '<div class="BlockOne BlockOne--active">'
          + '  <p class="BlockTwo BlockTwo--valid SomeOtherBlock">Foo</p>'
          + '  <p>Bar</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["bem-misused-modifiers"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)
  })

})

describe("duplicate-ids", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when the same ID attribute is used more than once", function() {
    var $html = $(''
          + '<div id="foobar">'
          + '  <p id="foobar">Foo</p>'
          + '  <p id="barfoo">Bar <em id="barfoo">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["duplicate-ids"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The id 'foobar' appears more than once in the HTML.")
    expect(log[1].message).toBe("The id 'barfoo' appears more than once in the HTML.")
    expect(log[0].context).toEqual([$html[0], $html.find("p#foobar")[0]])
    expect(log[1].context).toEqual([$html.find("p#barfoo")[0], $html.find("em#barfoo")[0]])

  })

  it("doesn't warn when all ids are unique", function() {
    var $html = $(''
          + '<div id="foobar1">'
          + '  <p id="foobar2">Foo</p>'
          + '  <p id="barfoo1">Bar <em id="barfoo2">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["duplicate-ids"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)
  })

})

describe("inline-event-handlers", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when inline event handlers are found on elements", function() {
    var $html = $(''
          + '<div onresize="alert(\'bad!\')">'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#" onclick="alert(\'bad!\')">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["inline-event-handlers"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The 'onresize' event handler was found inline in the HTML.")
    expect(log[1].message).toBe("The 'onclick' event handler was found inline in the HTML.")
    expect(log[0].context).toEqual($html[0])
    expect(log[1].context).toEqual($html.find("a")[0])

  })

  it("doesn't warn there are no inline event handlers", function() {
    var $html = $(''
          + '<div>'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["inline-event-handlers"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)
  })

})

describe("nonsemantic-elements", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when unattributed <div> or <span> elements appear in the HTML", function() {
    var $html = $(''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[1].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[2].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].context).toBe($html.find("span")[0])
    expect(log[2].context).toBe($html.find("div")[0])

  })

  it("doesn't warn when attributed <div> or <span> elements appear in the HTML", function() {
    var $html = $(''
          + '<div data-foo="bar">'
          + '  <span class="alert">Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(1)
    expect(log[0].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).toBe($html.find("div")[0])

  })

  it("doesn't warn when unattributed, semantic elements appear in the HTML", function() {
    var $html = $(''
          + '<section data-foo="bar">'
          + '  <h1>Foo</h1>'
          + '  <p>Foo</p>'
          + '</section>'
        )

    HTMLInspector.inspect({
      rules: ["nonsemantic-elements"],
      domRoot: $html,
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
    var $html = $(''
          + '<div class="fizz buzz">'
          + '  <p class="foo bar baz">This is just a test</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["unused-classes"],
      domRoot: $html,
      complete: complete
    })

    expect(log[0].message).toBe("The class 'fizz' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).toBe("The class 'buzz' is used in the HTML but not found in any stylesheet.")
    expect(log[2].message).toBe("The class 'baz' is used in the HTML but not found in any stylesheet.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].context).toBe($html[0])
    expect(log[2].context).toBe($html.find("p")[0])

  })

  it("doesn't warn when whitelisted classes appear in the HTML", function() {
    var $html = $(''
          + '<div class="supports-flexbox">'
          + '  <p class="js-alert">This is just a test</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["unused-classes"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)

  })

  it("allows for customizing the whitelist", function() {

    var $html = $(''
          + '<div class="foo supports-flexbox">'
          + '  <p class="js-alert bar">This is just a test</p>'
          + '</div>'
        )

    HTMLInspector.extensions.css.whitelist = /foo|bar/

    HTMLInspector.inspect({
      rules: ["unused-classes"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The class 'supports-flexbox' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).toBe("The class 'js-alert' is used in the HTML but not found in any stylesheet.")

  })

})

})