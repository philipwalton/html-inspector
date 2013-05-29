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
          + '  <p>More</p>'
          + '  <blockquote>'
          + '    <p>Nested</p>'
          + '    <p class="stuff">Stuff'
          + '      <em id="emphasis">lolz</em>'
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
      expect(events.length).toBe(8)
      expect(events[0]).toBe("section")
      expect(events[1]).toBe("h1")
      expect(events[2]).toBe("p")
      expect(events[3]).toBe("p")
      expect(events[4]).toBe("blockquote")
      expect(events[5]).toBe("p")
      expect(events[6]).toBe("p")
      expect(events[7]).toBe("em")
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