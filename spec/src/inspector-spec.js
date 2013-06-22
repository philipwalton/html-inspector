describe("HTMLInspector", function() {

  var originalRules = HTMLInspector.rules
    , originalModules = HTMLInspector.modules
    , html = parseHTML(''
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

  beforeEach(function() {
    // remove all rule and modules
    HTMLInspector.rules = new originalRules.constructor()
    HTMLInspector.modules = new originalModules.constructor()
  })

  afterEach(function() {
    // restore all rules and modules
    HTMLInspector.rules = originalRules
    HTMLInspector.modules = originalModules
  })

  it("only runs the specified rules (or all rules if none are specified)", function() {
    var rules = []
    HTMLInspector.rules.add("one", function(listener, reporter) {
      listener.on("beforeInspect", function(name) { rules.push("one") })
    })
    HTMLInspector.rules.add("two", function(listener, reporter) {
      listener.on("beforeInspect", function(name) { rules.push("two") })
    })
    HTMLInspector.rules.add("three", function(listener, reporter) {
      listener.on("beforeInspect", function(name) { rules.push("three") })
    })
    HTMLInspector.inspect()
    expect(rules.length).toBe(3)
    expect(rules[0]).toBe("one")
    expect(rules[1]).toBe("two")
    expect(rules[2]).toBe("three")
    rules = []
    HTMLInspector.inspect(["one"])
    expect(rules.length).toBe(1)
    expect(rules[0]).toBe("one")
    rules = []
    HTMLInspector.inspect(["one", "two"])
    expect(rules.length).toBe(2)
    expect(rules[0]).toBe("one")
    expect(rules[1]).toBe("two")
  })

  it("invokes the onComplete callback passing in an array of errors", function() {
    var log
    HTMLInspector.rules.add("one-two", function(listener, reporter) {
      reporter.warn("one-two", "This is the `one` error message", document)
      reporter.warn("one-two", "This is the `two` error message", document)

    })
    HTMLInspector.rules.add("three", function(listener, reporter) {
      reporter.warn("three", "This is the `three` error message", document)
    })
    HTMLInspector.inspect(function(errors) {
      log = errors
    })
    expect(log.length).toBe(3)
    expect(log[0].message).toBe("This is the `one` error message")
    expect(log[1].message).toBe("This is the `two` error message")
    expect(log[2].message).toBe("This is the `three` error message")
  })

  it("accepts a variety of options for the config paramter", function() {
    var log = []
      , div = document.createElement("div")
      , dom

    // create the dom object
    (dom = document.createElement("p")).innerHTML = "foobar"

    HTMLInspector.rules.add("dom", function(listener, reporter) {
      listener.on("element", function(name) {
        log.push(this)
      })
    })
    HTMLInspector.rules.add("rules", function() {
      log.push("rules")
    })
    // if it's an object, assume it's the full config object
    HTMLInspector.inspect({
      useRules: ["dom"],
      domRoot: dom,
      onComplete: function(errors) {
        log.push("done")
      }
    })
    expect(log.length).toBe(2)
    expect(log[0].innerHTML).toBe("foobar")
    expect(log[1]).toBe("done")
    // if it's an array, assume it's a list of rules
    HTMLInspector.inspect(["dom"])
    expect(log[0]).not.toBe("rules")
    log = []
    // if it's a string, assume it's a selector
    HTMLInspector.inspect("body")
    expect(log[1]).toBe(document.body)
    log = []
    // if it's a DOM element, assume it's the domRoot
    HTMLInspector.inspect(div)
    expect(log[1]).toBe(div)
    log = []
    // if it's a function, assume it's complete
    HTMLInspector.inspect(function(errors) {
      log = "func"
    })
    expect(log).toBe("func")
  })

  it("ignores elements matching the `exclude` config option", function() {
    var events = []
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("element", function(name) {
        events.push(name)
      })
    })
    HTMLInspector.inspect({
      domRoot: html,
      exclude: ["h1", "p"]
    })
    expect(events).toEqual(["section", "a", "blockquote", "em"])
    events = []
    HTMLInspector.inspect({
      domRoot: html,
      exclude: html.querySelector("blockquote")
    })
    expect(events).toEqual(["section", "h1", "p", "p", "a", "p", "p", "em"])
  })

  it("ignores elements that descend from the `excludeSubTree` config option", function() {
    var events = []
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("element", function(name) {
        events.push(name)
      })
    })
    HTMLInspector.inspect({
      domRoot: html,
      excludeSubTree: "p"
    })
    expect(events).toEqual(["section", "h1", "p", "p", "blockquote", "p", "p"])
    events = []
    HTMLInspector.inspect({
      domRoot: html,
      excludeSubTree: [html.querySelector("p:not(.first)"), html.querySelector("blockquote")]
    })
    expect(events).toEqual(["section", "h1", "p", "p", "blockquote"])
  })

  it("inspects the HTML starting from the specified domRoot", function() {
    var events = []
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("element", function(name) {
        events.push(name)
      })
    })
    HTMLInspector.inspect()
    expect(events[0]).toBe("html")
    events = []
    HTMLInspector.inspect({ domRoot: html })
    expect(events[0]).toBe("section")
  })

  it("triggers `beforeInspect` before the DOM traversal", function() {
    var events = []
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("beforeInspect", function() {
        events.push("beforeInspect")
      })
      listener.on("element", function() {
        events.push("element")
      })
    })
    HTMLInspector.inspect(html)
    expect(events.length).toBeGreaterThan(2)
    expect(events[0]).toBe("beforeInspect")
    expect(events[1]).toBe("element")
  })

  it("traverses the DOM emitting events for each element", function() {
    var events = []
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("element", function(name) {
        events.push(name)
      })
    })
    HTMLInspector.inspect(html)
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
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("id", function(name) {
        events.push(name)
      })
    })
    HTMLInspector.inspect(html)
    expect(events.length).toBe(2)
    expect(events[0]).toBe("heading")
    expect(events[1]).toBe("emphasis")
  })

  it("traverses the DOM emitting events for each class attribute", function() {
    var events = []
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("class", function(name) {
        events.push(name)
      })
    })
    HTMLInspector.inspect(html)
    expect(events.length).toBe(5)
    expect(events[0]).toBe("section")
    expect(events[1]).toBe("multiple")
    expect(events[2]).toBe("classes")
    expect(events[3]).toBe("first")
    expect(events[4]).toBe("stuff")
  })

  it("traverses the DOM emitting events for each attribute", function() {
    var events = []
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("attribute", function(name, value) {
        events.push({name:name, value:value})
      })
    })
    HTMLInspector.inspect(html)
    expect(events.length).toBe(11)
    expect(events[0]).toEqual({name:"class", value:"section"})
    expect(events[1]).toEqual({name:"class", value:"multiple classes"})
    expect(events[2]).toEqual({name:"id", value:"heading"})
    expect(events[3]).toEqual({name:"class", value:"first"})
    expect(events[4]).toEqual({name:"href", value:"#"})
    expect(events[5]).toEqual({name:"data-foo", value:"bar"})
    expect(events[6]).toEqual({name:"onclick", value:"somefunc()"})
    expect(events[7]).toEqual({name:"style", value:"display: inline;"})
    expect(events[8]).toEqual({name:"class", value:"stuff"})
    expect(events[9]).toEqual({name:"data-bar", value:"foo"})
    expect(events[10]).toEqual({name:"id", value:"emphasis"})
  })

  it("triggers `afterInspect` after the DOM traversal", function() {
    var events = []
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("afterInspect", function() {
        events.push("afterInspect")
      })
      listener.on("element", function() {
        events.push("element")
      })
    })
    HTMLInspector.inspect(html)
    expect(events.length).toBeGreaterThan(2)
    expect(events[events.length - 1]).toBe("afterInspect")
  })

  it("ignores SVG elements and their children", function() {
    var events = []
      , div = document.createElement("div")
    HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
      listener.on("element", function(name) {
        events.push(name)
      })
    })
    div.innerHTML = ""
      + '<svg viewBox="0 0 512 512" height="22" width="22">'
      + '  <path></path>'
      + '</svg>'
    HTMLInspector.inspect(div)
    expect(events.length).toBe(1)
    expect(events[0]).toBe("div")
  })


})