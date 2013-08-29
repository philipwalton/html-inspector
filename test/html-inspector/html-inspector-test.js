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

  describe(".inspect", function() {

    it("inspects the HTML starting from the specified domRoot", function() {
      var events = []
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
        listener.on("element", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect()
      expect(events[0]).to.equal("html")
      events = []
      HTMLInspector.inspect({ domRoot: html })
      expect(events[0]).to.equal("section")
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
      expect(rules.length).to.equal(3)
      expect(rules[0]).to.equal("one")
      expect(rules[1]).to.equal("two")
      expect(rules[2]).to.equal("three")
      rules = []
      HTMLInspector.inspect(["one"])
      expect(rules.length).to.equal(1)
      expect(rules[0]).to.equal("one")
      rules = []
      HTMLInspector.inspect(["one", "two"])
      expect(rules.length).to.equal(2)
      expect(rules[0]).to.equal("one")
      expect(rules[1]).to.equal("two")
    })

    it("excludes rules specifically mentioned in the `excludeRules` options", function() {
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
      HTMLInspector.inspect({
        excludeRules: ["one", "two"]
      })
      expect(rules.length).to.equal(1)
      expect(rules[0]).to.equal("three")
      rules = []
      HTMLInspector.inspect({
        useRules: ["one", "two"],
        excludeRules: ["two"]
      })
      expect(rules.length).to.equal(1)
      expect(rules[0]).to.equal("one")
    })

    it("ignores elements matching the `excludeElements` config option", function() {
      var events = []
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
        listener.on("element", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect({
        domRoot: html,
        excludeElements: ["h1", "p"]
      })
      expect(events).to.deep.equal(["section", "a", "blockquote", "em"])
      events = []
      HTMLInspector.inspect({
        domRoot: html,
        excludeElements: html.querySelector("blockquote")
      })
      expect(events).to.deep.equal(["section", "h1", "p", "p", "a", "p", "p", "em"])
    })

    it("ignores elements that descend from the `excludeSubTrees` config option", function() {
      var events = []
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
        listener.on("element", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect({
        domRoot: html,
        excludeSubTrees: "p"
      })
      expect(events).to.deep.equal(["section", "h1", "p", "p", "blockquote", "p", "p"])
      events = []
      HTMLInspector.inspect({
        domRoot: html,
        excludeSubTrees: [html.querySelector("p:not(.first)"), html.querySelector("blockquote")]
      })
      expect(events).to.deep.equal(["section", "h1", "p", "p", "blockquote"])
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
      expect(log.length).to.equal(3)
      expect(log[0].message).to.equal("This is the `one` error message")
      expect(log[1].message).to.equal("This is the `two` error message")
      expect(log[2].message).to.equal("This is the `three` error message")
    })

    it("accepts a variety of types for the options paramter", function() {
      var log = []
        , div = document.createElement("div")
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
        domRoot: parseHTML("<p>foobar</p>"),
        onComplete: function(errors) {
          log.push("done")
        }
      })
      expect(log.length).to.equal(2)
      expect(log[0].innerHTML).to.equal("foobar")
      expect(log[1]).to.equal("done")
      log = []
      // if it's an array, assume it's a list of rules
      HTMLInspector.inspect(["dom"])
      expect(log.indexOf("rules")).to.equal(-1)
      log = []
      // if it's a string, assume it's a selector
      HTMLInspector.inspect("body")
      expect(log[1]).to.equal(document.body)
      log = []
      // if it's a DOM element, assume it's the domRoot
      HTMLInspector.inspect(div)
      expect(log[1]).to.equal(div)
      log = []
      // if it's a function, assume it's complete
      HTMLInspector.inspect(function(errors) {
        log = "func"
      })
      expect(log).to.equal("func")
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
      expect(events.length).to.be.above(2)
      expect(events[0]).to.equal("beforeInspect")
      expect(events[1]).to.equal("element")
    })

    it("traverses the DOM emitting events for each element", function() {
      var events = []
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
        listener.on("element", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect(html)
      expect(events.length).to.equal(9)
      expect(events[0]).to.equal("section")
      expect(events[1]).to.equal("h1")
      expect(events[2]).to.equal("p")
      expect(events[3]).to.equal("p")
      expect(events[4]).to.equal("a")
      expect(events[5]).to.equal("blockquote")
      expect(events[6]).to.equal("p")
      expect(events[7]).to.equal("p")
      expect(events[8]).to.equal("em")
    })

    it("traverses the DOM emitting events for each id attribute", function() {
      var events = []
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
        listener.on("id", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect(html)
      expect(events.length).to.equal(2)
      expect(events[0]).to.equal("heading")
      expect(events[1]).to.equal("emphasis")
    })

    it("traverses the DOM emitting events for each class attribute", function() {
      var events = []
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
        listener.on("class", function(name) {
          events.push(name)
        })
      })
      HTMLInspector.inspect(html)
      expect(events.length).to.equal(5)
      expect(events[0]).to.equal("section")
      expect(events[1]).to.equal("multiple")
      expect(events[2]).to.equal("classes")
      expect(events[3]).to.equal("first")
      expect(events[4]).to.equal("stuff")
    })

    it("traverses the DOM emitting events for each attribute", function() {
      var events = []
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
        listener.on("attribute", function(name, value) {
          events.push({name:name, value:value})
        })
      })
      HTMLInspector.inspect(html)
      expect(events.length).to.equal(11)
      expect(events[0]).to.deep.equal({name:"class", value:"section"})
      expect(events[1]).to.deep.equal({name:"class", value:"multiple classes"})
      expect(events[2]).to.deep.equal({name:"id", value:"heading"})
      expect(events[3]).to.deep.equal({name:"class", value:"first"})
      expect(events[4]).to.deep.equal({name:"href", value:"#"})
      expect(events[5]).to.deep.equal({name:"data-foo", value:"bar"})
      expect(events[6]).to.deep.equal({name:"onclick", value:"somefunc()"})
      expect(events[7]).to.deep.equal({name:"style", value:"display: inline;"})
      expect(events[8]).to.deep.equal({name:"class", value:"stuff"})
      expect(events[9]).to.deep.equal({name:"data-bar", value:"foo"})
      expect(events[10]).to.deep.equal({name:"id", value:"emphasis"})
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
      expect(events.length).to.be.above(2)
      expect(events[events.length - 1]).to.equal("afterInspect")
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
      expect(events.length).to.equal(1)
      expect(events[0]).to.equal("div")
    })

    it("logs warnings to the console by default when onComplete isn't overriden", function() {
      // stub out console.warn
      sinon.stub(console, "warn")

      HTMLInspector.rules.add("console-warn-test", function(listener, reporter) {
        listener.on("element", function(name) {
          reporter.warn("console-warn-test", "Element found", this)
        })
      })

      HTMLInspector.inspect(html)
      expect(console.warn.callCount).to.equal(9)
      expect(console.warn.getCall(0).args[0]).to.equal("Element found")
      expect(console.warn.getCall(0).args[1]).to.equal(html)

      console.warn.restore()
    })

    it("does not console.warn cross-domain iframe elements", function() {
      var div = document.createElement("div")
        , iframe1 = document.createElement("iframe")
        , iframe2 = document.createElement("iframe")

      iframe1.src = "http://example.com"
      iframe2.src = "foobar.html"
      div.appendChild(iframe1)
      div.appendChild(iframe2)

      // stub out console.warn
      sinon.stub(console, "warn")

      HTMLInspector.rules.add("cross-domain-test", function(listener, reporter) {
        listener.on("element", function(name) {
          reporter.warn("cross-domain-test", "This is a cross-origin iframe", this)
        })
      })
      HTMLInspector.inspect(div)
      expect(console.warn.callCount).to.equal(3)
      expect(console.warn.getCall(1).args[1]).to.equal("(can't display iframe with cross-origin source: http://example.com/)")
      expect(console.warn.getCall(2).args[1]).to.equal(iframe2)
      console.warn.restore()
    })

  })

})
