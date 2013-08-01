var no = { op: function(){}}

function parseHTML(string) {
  var container = document.createElement("div")
  container.innerHTML = string
  return container.firstChild
}

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

describe("Callbacks", function() {

  var Callbacks = HTMLInspector._constructors.Callbacks
    , cb
    , log
    , f1 = function(a, b, c) { log.push({id:"f1", args:[a, b, c], context:this}) }
    , f2 = function(a, b, c) { log.push({id:"f2", args:[a, b, c], context:this}) }
    , f3 = function(a, b, c) { log.push({id:"f3", args:[a, b, c], context:this}) }

  beforeEach(function() {
    cb = new Callbacks()
    log = []
  })

  it("can add functions", function() {
    cb.add(f1)
    cb.add(f2)
    cb.add(f3)
    expect(cb.handlers.length).toBe(3)
    expect(cb.handlers[0]).toBe(f1)
    expect(cb.handlers[1]).toBe(f2)
    expect(cb.handlers[2]).toBe(f3)
  })

  it("can remove functions", function() {
    cb.add(f1)
    cb.add(f2)
    cb.add(f3)
    cb.remove(f2)
    expect(cb.handlers.length).toBe(2)
    expect(cb.handlers[0]).toBe(f1)
    expect(cb.handlers[1]).toBe(f3)
    cb.remove(f3)
    expect(cb.handlers.length).toBe(1)
    expect(cb.handlers[0]).toBe(f1)
    cb.remove(f1)
    expect(cb.handlers.length).toBe(0)
  })

  it("call invoke the list of callbacks", function() {
    cb.fire()
    expect(log.length).toBe(0)
    cb.add(f1)
    cb.fire("ctx1", ["arg1", "arg2"])
    expect(log.length).toBe(1)
    expect(log[0]).toEqual({id:"f1", args:["arg1", "arg2", undefined], context:"ctx1"})
    log = []
    cb.add(f2)
    cb.fire("ctx1", ["arg1", "arg2", "arg3"])
    expect(log.length).toBe(2)
    expect(log[0]).toEqual({id:"f1", args:["arg1", "arg2", "arg3"], context:"ctx1"})
    expect(log[1]).toEqual({id:"f2", args:["arg1", "arg2", "arg3"], context:"ctx1"})
    log = []
    cb.add(f3)
    cb.fire("ctx2")
    expect(log.length).toBe(3)
    expect(log[0]).toEqual({id:"f1", args:[undefined, undefined, undefined], context:"ctx2"})
    expect(log[1]).toEqual({id:"f2", args:[undefined, undefined, undefined], context:"ctx2"})
    expect(log[2]).toEqual({id:"f3", args:[undefined, undefined, undefined], context:"ctx2"})
    log = []
    cb.remove(f2)
    cb.fire("ctx3", ["arg1"])
    expect(log.length).toBe(2)
    expect(log[0]).toEqual({id:"f1", args:["arg1", undefined, undefined], context:"ctx3"})
    expect(log[1]).toEqual({id:"f3", args:["arg1", undefined, undefined], context:"ctx3"})
  })

})

describe("Listener", function() {

  var Listener = HTMLInspector._constructors.Listener

  it("can add handlers to a specific event", function() {
    var listener = new Listener()
    listener.on("foo", no.op)
    listener.on("bar", no.op)
    expect(listener._events.foo).toBeDefined()
    expect(listener._events.bar).toBeDefined()
  })

  it("can trigger handlers on a specific event", function() {
    var listener = new Listener()
    spyOn(no, "op")
    listener.on("foo", no.op)
    listener.on("bar", no.op)
    listener.trigger("foo")
    listener.trigger("bar")
    expect(no.op.callCount).toBe(2)
  })

  it("can remove handlers from a specific event", function() {
    var listener = new Listener()
    spyOn(no, "op")
    listener.on("foo", no.op)
    listener.on("bar", no.op)
    listener.off("foo", no.op)
    listener.off("bar", no.op)
    listener.trigger("foo")
    listener.trigger("bar")
    expect(no.op.callCount).toBe(0)
  })

})

describe("Reporter", function() {

  var Reporter = HTMLInspector._constructors.Reporter

  it("can add an error to the report log", function() {
    var reporter = new Reporter()
    reporter.warn("rule-name", "This is the message", document)
    expect(reporter._errors.length).toBe(1)
    expect(reporter._errors[0].rule).toBe("rule-name")
    expect(reporter._errors[0].message).toBe("This is the message")
    expect(reporter._errors[0].context).toBe(document)
  })

  it("can get all the errors that have been logged", function() {
    var reporter = new Reporter()
    reporter.warn("rule-name", "This is the first message", document)
    reporter.warn("rule-name", "This is the second message", document)
    reporter.warn("rule-name", "This is the third message", document)
    expect(reporter.getWarnings().length).toBe(3)
    expect(reporter.getWarnings()[0].message).toBe("This is the first message")
    expect(reporter.getWarnings()[1].message).toBe("This is the second message")
    expect(reporter.getWarnings()[2].message).toBe("This is the third message")
  })

})

describe("Utils", function() {

  describe("toArray", function() {
    var toArray = HTMLInspector.utils.toArray
    it("consumes an array-like object and returns it as an array", function() {
      var args
      (function(a, b, c) {
        args = toArray(arguments)
      }("foo", "bar", "baz"))
      expect(Array.isArray(args)).toBe(true)
      expect(args).toEqual(["foo", "bar", "baz"])

      var scripts = toArray(document.querySelectorAll("script"))
      expect(Array.isArray(scripts)).toBe(true)
      expect(scripts.length).toBeGreaterThan(0)

      expect(toArray("foo")).toEqual(["f", "o", "o"])

      var div = document.createElement("div")
      div.className = "foo"
      expect(toArray(div.attributes).length).toEqual(1)
    })

    it("returns an empty array if it receives anything it can't turn in to an Array", function() {
      expect(toArray(null)).toEqual([])
      expect(toArray(undefined)).toEqual([])
      expect(toArray({})).toEqual([])
      expect(toArray(4)).toEqual([])
      expect(toArray(document.body)).toEqual([])
    })

  })

  describe("getAttributes", function() {
    var getAttributes = HTMLInspector.utils.getAttributes
    it("returns an array of the element attributes, sorted alphabetically by class name", function() {
      var div = document.createElement("div")
      div.setAttribute("foo", "FOO")
      div.setAttribute("bar", "BAR")
      div.setAttribute("baz", "BAZ")
      expect(getAttributes(div)).toEqual([
        {name: "bar", value: "BAR"},
        {name: "baz", value: "BAZ"},
        {name: "foo", value: "FOO"}
      ])
    })
  })

  describe("isRegExp", function() {
    var isRegExp = HTMLInspector.utils.isRegExp
    it("returns true if the passed object is a Regular Expression", function() {
      expect(isRegExp(/foo/ig)).toBe(true)
      expect(isRegExp(new RegExp("foo", "g"))).toBe(true)
      expect(isRegExp("foo")).toBe(false)
      expect(isRegExp(null)).toBe(false)
    })
  })

  describe("unique", function() {
    var unique = HTMLInspector.utils.unique
    it("consume an array and return a new array with no duplicate values", function() {
      expect(unique([1,2,2,3,1,4,5,4,5,6,5])).toEqual([1,2,3,4,5,6])
      expect(unique(["foo", "bar", "bar", "bar", "baz", "fo"])).toEqual(["bar", "baz", "fo", "foo"])
    })
  })

  describe("extend", function() {
    var extend = HTMLInspector.utils.extend
    it("extends a given object with all the properties in passed-in object(s)", function() {
      expect(extend({a:1, b:2}, {a:"a"})).toEqual({a:"a", b:2})
      expect(extend({a:1, b:2}, {a:null, c:"c"}, {b:undefined})).toEqual({a:null, b:undefined, c:"c"})
    })
  })


  describe("foundIn", function() {
    var foundIn = HTMLInspector.utils.foundIn
    it("matches a string against a string, RegExp, or list of strings/RegeExps", function() {
      expect(foundIn("foo", "foo")).toBe(true)
      expect(foundIn("foo", /^fo\w/)).toBe(true)
      expect(foundIn("foo", [/\d+/, /^fo\w/])).toBe(true)
      expect(foundIn("foo", ["fo", "f", /foo/])).toBe(true)
      expect(foundIn("bar", "foo")).toBe(false)
      expect(foundIn("bar", /^fo\w/)).toBe(false)
      expect(foundIn("bar", [/\d+/, /^fo\w/])).toBe(false)
      expect(foundIn("bar", ["fo", "f", /foo/])).toBe(false)
    })
  })

  describe("isCrossOrigin", function() {
    var isCrossOrigin = HTMLInspector.utils.isCrossOrigin
    it("returns true if the URL is cross-origin (port, protocol, or host don't match)", function() {
      expect(isCrossOrigin("https://google.com")).toBe(true)
      expect(isCrossOrigin("https://localhost/foobar")).toBe(true)
      expect(isCrossOrigin("http://localhost:12345/fizzbuzz.html")).toBe(true)
      // ignore this when running on PhantomJS
      if (location.protocol != "file:")
        expect(isCrossOrigin(location.href)).toBe(false)
    })
  })

  describe("matchesSelector", function() {
    var matchesSelector = HTMLInspector.utils.matchesSelector
    it("returns true if a DOM element matches a particular selector", function() {
      var div = document.createElement("div")
      div.setAttribute("foo", "FOO")
      expect(matchesSelector(div, "div[foo]")).toBe(true)
      expect(matchesSelector(div, "div[bar]")).toBe(false)

      expect(matchesSelector(document.body, "html > body")).toBe(true)
      expect(matchesSelector(document.body, ".body")).toBe(false)

      div.innerHTML = "<p id='foo'>foo <em>bar</em></p>"
      expect(matchesSelector(div.querySelector("em"), "#foo > em")).toBe(true)
      expect(matchesSelector(div.querySelector("em"), "#foo")).toBe(false)
    })

  })

  describe("matches", function() {
    var matches = HTMLInspector.utils.matches
    it("returns true if a DOM element matches any of the elements or selectors in the test object", function() {

      var div = document.createElement("div")
      div.setAttribute("foo", "FOO")
      expect(matches(div, "div[foo]")).toBe(true)
      expect(matches(div, "div[bar]")).toBe(false)

      expect(matches(document.body, ["html", "html > body"])).toBe(true)
      expect(matches(document.body, [".body", ".html", "p"])).toBe(false)

      div.innerHTML = "<p id='foo'>foo <em>bar</em></p>"
      expect(matches(div.querySelector("em"), ["#foo", "#foo > em"])).toBe(true)
      expect(matches(div.querySelector("em"), [document.documentElement, document.body])).toBe(false)

      expect(matches(div.querySelector("em"), ["#foo", "#foo > em"])).toBe(true)

      expect(matches(div, null)).toBe(false)
    })
  })

  describe("parents", function() {
    var parents = HTMLInspector.utils.parents
    it("returns an array of all the parent elements of the passed DOM element", function() {
      var rents
        , div = document.createElement("div")
      expect(parents(div)).toEqual([])

      div.innerHTML = "<p id='foo'><span>foo <em>bar</em><span></p>"
      rents = parents(div.querySelector("em"))
      expect(rents.length).toBe(3)
      expect(rents[0].nodeName.toLowerCase()).toBe("span")
      expect(rents[1].nodeName.toLowerCase()).toBe("p")
      expect(rents[2]).toBe(div)

      expect(parents(document.querySelector("body > *")).length).toBe(2)
      expect(parents(document.querySelector("body > *"))[0]).toBe(document.body)
      expect(parents(document.querySelector("body > *"))[1]).toBe(document.documentElement)

    })
  })

})

describe("Modules", function() {

  it("can add a new module", function() {
    HTMLInspector.modules.add("new-module", {})
    expect(HTMLInspector.modules["new-module"]).toBeDefined()
    ;delete HTMLInspector.modules["new-module"]
  })

  it("can extend an existing module with an options object", function() {
    HTMLInspector.modules.add("new-module", {foo: "bar"})
    HTMLInspector.modules.extend("new-module", {fizz: "buzz"})
    expect(HTMLInspector.modules["new-module"]).toEqual({foo:"bar", fizz:"buzz"})
    ;delete HTMLInspector.modules["new-module"]
  })

  it("can extend an existing module with a function that returns an options object", function() {
    HTMLInspector.modules.add("new-module", {list: [1]})
    HTMLInspector.modules.extend("new-module", function() {
      this.list.push(2)
      this.foo = "bar"
      return this
    })
    expect(HTMLInspector.modules["new-module"]).toEqual({list:[1, 2], foo:"bar"})
    ;delete HTMLInspector.modules["new-module"]
  })

describe("css", function() {

  var css = HTMLInspector.modules.css
    , originalStyleSheets = css.styleSheets
    , classes = ["alpha", "bar", "bravo", "charlie", "delta", "echo", "foo", "importee", "importer"]

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
      , head = document.querySelector("head")
      , styles = parseHTML(""
          + "<style id='style'>"
          + "  .style .foo, .style .bar { visiblility: visible }"
          + "  .style .fizz, .style .buzz { visiblility: visible }"
          + "</style>"
        )

    // first remove any style tags taht browser plugins might be putting in
    Array.prototype.slice.call(document.querySelectorAll("style")).forEach(function(el) {
      el.parentNode.removeChild(el)
    })

    head.appendChild(styles)

    css.styleSheets = "link[href$='-spec.css'], style"
    expect(css.getClassSelectors()).toEqual(extraClasses)
    head.removeChild(styles)
  })

})


describe("validation", function() {

  var validation = HTMLInspector.modules.validation
    , originalElementWhitelist = validation.elementWhitelist
    , originalAttributeWhitelist = validation.attributeWhitelist

  afterEach(function() {
    validation.elementWhitelist = originalElementWhitelist
    validation.attributeWhitelist = originalAttributeWhitelist
  })

  it("can determine if an element is a valid HTML element", function() {
    expect(validation.isElementValid("p")).toBe(true)
    expect(validation.isElementValid("time")).toBe(true)
    expect(validation.isElementValid("bogus")).toBe(false)
    expect(validation.isElementValid("hgroup")).toBe(false)
  })

  it("can determine if an element is obsolete", function() {
    expect(validation.isElementObsolete("p")).toBe(false)
    expect(validation.isElementObsolete("bogus")).toBe(false)
    expect(validation.isElementObsolete("hgroup")).toBe(true)
    expect(validation.isElementObsolete("blink")).toBe(true)
    expect(validation.isElementObsolete("center")).toBe(true)
  })

  it("can determine if an attribute is allowed on an element", function() {
    expect(validation.isAttributeValidForElement("href", "a")).toBe(true)
    expect(validation.isAttributeValidForElement("aria-foobar", "nav")).toBe(true)
    expect(validation.isAttributeValidForElement("data-stuff", "section")).toBe(true)
    expect(validation.isAttributeValidForElement("href", "button")).toBe(false)
    expect(validation.isAttributeValidForElement("placeholder", "select")).toBe(false)
  })

  it("can determine if an attribute is obsolute for an element", function() {
    expect(validation.isAttributeObsoleteForElement("align", "div")).toBe(true)
    expect(validation.isAttributeObsoleteForElement("bgcolor", "body")).toBe(true)
    expect(validation.isAttributeObsoleteForElement("border", "img")).toBe(true)
    expect(validation.isAttributeObsoleteForElement("href", "div")).toBe(false)
    expect(validation.isAttributeObsoleteForElement("charset", "meta")).toBe(false)
  })

  it("can determine if an attribute is required for an element", function() {
    expect(validation.isAttributeRequiredForElement("src", "img")).toBe(true)
    expect(validation.isAttributeRequiredForElement("alt", "img")).toBe(true)
    expect(validation.isAttributeRequiredForElement("action", "form")).toBe(true)
    expect(validation.isAttributeRequiredForElement("rows", "textarea")).toBe(true)
    expect(validation.isAttributeRequiredForElement("cols", "textarea")).toBe(true)
    expect(validation.isAttributeRequiredForElement("id", "div")).toBe(false)
    expect(validation.isAttributeRequiredForElement("target", "a")).toBe(false)
  })

  it("can get a list of required attribute given an element", function() {
    expect(validation.getRequiredAttributesForElement("img")).toEqual(["alt", "src"])
    expect(validation.getRequiredAttributesForElement("optgroup")).toEqual(["label"])
    expect(validation.getRequiredAttributesForElement("form")).toEqual(["action"])
    expect(validation.getRequiredAttributesForElement("div")).toEqual([])
  })

  it("can determine if a child elememnt is allowed inside it's parent", function() {
    expect(validation.isChildAllowedInParent("div", "ul")).toBe(false)
    expect(validation.isChildAllowedInParent("div", "span")).toBe(false)
    expect(validation.isChildAllowedInParent("section", "em")).toBe(false)
    expect(validation.isChildAllowedInParent("title", "body")).toBe(false)
    expect(validation.isChildAllowedInParent("strong", "p")).toBe(true)
    expect(validation.isChildAllowedInParent("li", "ol")).toBe(true)
    expect(validation.isChildAllowedInParent("fieldset", "form")).toBe(true)
    expect(validation.isChildAllowedInParent("td", "tr")).toBe(true)
  })

  it("ignores elements that are whitelisted", function() {
    validation.elementWhitelist = validation.elementWhitelist.concat(["foo", "bar", "font", "center"])
    // valid elements
    expect(validation.isElementValid("foo")).toBe(true)
    expect(validation.isElementValid("bar")).toBe(true)
    // obsolete elements
    expect(validation.isElementObsolete("font")).toBe(false)
    expect(validation.isElementObsolete("center")).toBe(false)
  })

  it("ignores attributes that are whitelisted", function() {
    validation.attributeWhitelist = validation.attributeWhitelist.concat(["src", "placeholder", "align", /^bg[a-z]+$/])
    // valid elements
    expect(validation.isAttributeValidForElement("placeholder", "select")).toBe(true)
    expect(validation.isAttributeValidForElement("ng-model", "div")).toBe(true)
    // obsolete elements
    expect(validation.isAttributeObsoleteForElement("align", "div")).toBe(false)
    expect(validation.isAttributeObsoleteForElement("bgcolor", "body")).toBe(false)
    // required attributes
    expect(validation.isAttributeRequiredForElement("src", "img")).toBe(false)

  })

})

})

describe("Rules", function() {

  it("can add a new rule", function() {
    HTMLInspector.rules.add("new-rule", no.op)
    expect(HTMLInspector.rules["new-rule"]).toBeDefined()
    ;delete HTMLInspector.rules["new-rule"]
  })

  it("can extend an existing rule with an options object", function() {
    var config = {foo: "bar"}
    HTMLInspector.rules.add("new-rule", config, no.op)
    HTMLInspector.rules.extend("new-rule", {fizz: "buzz"})
    expect(HTMLInspector.rules["new-rule"].config).toEqual({foo:"bar", fizz:"buzz"})
    ;delete HTMLInspector.rules["new-rule"]
  })

  it("can extend an existing rule with a function that returns an options object", function() {
    var config = {list: [1]}
    HTMLInspector.rules.add("new-rule", config, no.op)
    HTMLInspector.rules.extend("new-rule", function(config) {
      config.list.push(2)
      return config
    })
    expect(HTMLInspector.rules["new-rule"].config).toEqual({list:[1, 2]})
    HTMLInspector.rules.extend("new-rule", function(config) {
      this.foo = "bar"
      return this
    })
    expect(HTMLInspector.rules["new-rule"].config).toEqual({list:[1, 2], foo:"bar"})
    ;delete HTMLInspector.rules["new-rule"]
  })

describe("bem-conventions", function() {

  var log
    , originalConfig = HTMLInspector.rules["bem-conventions"].config

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  afterEach(function() {
    HTMLInspector.rules["bem-conventions"].config.methodology = "suit"
  })

  describe("config", function() {

    var config = HTMLInspector.rules["bem-conventions"].config

    it("can take a BEM modifier or element class and returns its block's class name", function() {
      expect(config.getBlockName("Block--modifier")).toBe("Block")
      expect(config.getBlockName("BlockName--someModifier")).toBe("BlockName")
      expect(config.getBlockName("Block-element")).toBe("Block")
      expect(config.getBlockName("BlockName-subElement")).toBe("BlockName")
      expect(config.getBlockName("BlockName-subElement--modifierName")).toBe("BlockName-subElement")
      expect(config.getBlockName("BlockName")).toBe(false)
      expect(config.getBlockName("Foo---bar")).toBe(false)
      expect(config.getBlockName("Foo--bar--baz")).toBe(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.getBlockName("block--modifier")).toBe("block")
      expect(config.getBlockName("block-name--some-modifier")).toBe("block-name")
      expect(config.getBlockName("block__element")).toBe("block")
      expect(config.getBlockName("block-name__sub-element")).toBe("block-name")
      expect(config.getBlockName("block-name__sub-element--modifier-name")).toBe("block-name__sub-element")
      expect(config.getBlockName("block-name")).toBe(false)
      expect(config.getBlockName("foo---bar")).toBe(false)
      expect(config.getBlockName("foo--bar__baz")).toBe(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.getBlockName("block_modifier")).toBe("block")
      expect(config.getBlockName("block-name_some_modifier")).toBe("block-name")
      expect(config.getBlockName("block__element")).toBe("block")
      expect(config.getBlockName("block-name__sub-element")).toBe("block-name")
      expect(config.getBlockName("block-name__sub-element_modifier_name")).toBe("block-name__sub-element")
      expect(config.getBlockName("block-name")).toBe(false)
      expect(config.getBlockName("foo___bar")).toBe(false)
      expect(config.getBlockName("foo_bar__baz")).toBe(false)
    })

    it("can determine if a class is a block element class", function() {
      expect(config.isElement("Block-element")).toBe(true)
      expect(config.isElement("BlockName-elementName")).toBe(true)
      expect(config.isElement("Block--modifier")).toBe(false)
      expect(config.isElement("BlockName--modifierName")).toBe(false)
      expect(config.isElement("Block--modifier-stuffz")).toBe(false)
      expect(config.isElement("Block--modifier--stuffz")).toBe(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.isElement("block__element")).toBe(true)
      expect(config.isElement("block-name__element-name")).toBe(true)
      expect(config.isElement("block--modifier")).toBe(false)
      expect(config.isElement("block-name--modifier-name")).toBe(false)
      expect(config.isElement("block__element__sub-element")).toBe(false)
      expect(config.isElement("block--modifier--stuffz")).toBe(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.isElement("block__element")).toBe(true)
      expect(config.isElement("block-name__element-name")).toBe(true)
      expect(config.isElement("block_modifier")).toBe(false)
      expect(config.isElement("block-name_modifier_name")).toBe(false)
      expect(config.isElement("block__element__sub-element")).toBe(false)
      expect(config.isElement("block_modifier_stuffz")).toBe(false)
    })

    it("can determine if a class is a block modifier class", function() {
      expect(config.isModifier("Block--modifier")).toBe(true)
      expect(config.isModifier("BlockName--modifierName")).toBe(true)
      expect(config.isModifier("BlockName-elementName--modifierName")).toBe(true)
      expect(config.isModifier("Block-element")).toBe(false)
      expect(config.isModifier("BlockName-elementName")).toBe(false)
      expect(config.isModifier("Block--modifier-stuffz")).toBe(false)
      expect(config.isModifier("Block--modifier--stuffz")).toBe(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.isModifier("block--modifier")).toBe(true)
      expect(config.isModifier("block-name--modifier-name")).toBe(true)
      expect(config.isModifier("block-name__element-name--modifier-name")).toBe(true)
      expect(config.isModifier("block__element")).toBe(false)
      expect(config.isModifier("block-name__element-name")).toBe(false)
      expect(config.isModifier("block--modifierStuffz")).toBe(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.isModifier("block_modifier")).toBe(true)
      expect(config.isModifier("block-name_modifier_name")).toBe(true)
      expect(config.isModifier("block-name__element-name_modifier_name")).toBe(true)
      expect(config.isModifier("block__element")).toBe(false)
      expect(config.isModifier("block-name__element-name")).toBe(false)
      expect(config.isModifier("block_modifierStuffz")).toBe(false)
    })

  })

  it("warns when a BEM element class is used when not the descendent of a block", function() {
    var html = parseHTML(''
          + '<div class="BlockOne SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-elementName">three</em></p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM element 'BlockTwo-element' must be a descendent of 'BlockTwo'.")
    expect(log[1].message).toBe("The BEM element 'BlockThree-elementName' must be a descendent of 'BlockThree'.")
    expect(log[0].context).toBe(html.querySelector(".BlockTwo-element"))
    expect(log[1].context).toBe(html.querySelector(".BlockThree-elementName"))
  })

  it("doesn't warn when a BEM element class is used as the descendent of a block", function() {
    var html = parseHTML(''
          + '<div class="BlockThree BlockTwo SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-elementName">three</em></p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("warns when a BEM modifier class is used without the unmodified block or element class", function() {
    var html = parseHTML(''
          + '<div class="BlockOne--active">'
          + '  <p class="BlockTwo--validName BlockThree SomeOtherBlock">Foo</p>'
          + '  <p class="Block-element--modified">Bar</p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The BEM modifier class 'BlockOne--active' was found without the unmodified class 'BlockOne'.")
    expect(log[0].context).toBe(html)
    expect(log[1].message).toBe("The BEM modifier class 'BlockTwo--validName' was found without the unmodified class 'BlockTwo'.")
    expect(log[1].context).toBe(html.querySelector(".BlockTwo--validName"))
    expect(log[2].message).toBe("The BEM modifier class 'Block-element--modified' was found without the unmodified class 'Block-element'.")
    expect(log[2].context).toBe(html.querySelector(".Block-element--modified"))
  })

  it("doesn't warn when a BEM modifier is used along with the unmodified block or element class", function() {
    var html = parseHTML(''
          + '<div class="BlockOne BlockOne--active">'
          + '  <p class="BlockTwo BlockTwo--validName SomeOtherBlock">Foo</p>'
          + '  <p>Bar</p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("allows for customization by altering the config object", function() {
    var html = parseHTML(''
          + '<div class="block-one">'
          + '  <p class="block-two---valid-name">Foo</p>'
          + '  <p class="block-three___element-name">Bar</p>'
          + '</div>'
        )
    HTMLInspector.rules.extend("bem-conventions", {
      methodology: {
        modifier: /^((?:[a-z]+\-)*[a-z]+(?:___(?:[a-z]+\-)*[a-z]+)?)\-\-\-(?:[a-z]+\-)*[a-z]+$/,
        element: /^((?:[a-z]+\-)*[a-z]+)___(?:[a-z]+\-)*[a-z]+$/
      }
    })
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM modifier class 'block-two---valid-name' was found without the unmodified class 'block-two'.")
    expect(log[1].message).toBe("The BEM element 'block-three___element-name' must be a descendent of 'block-three'.")
  })

})

describe("duplicate-ids", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when the same ID attribute is used more than once", function() {
    var html = parseHTML(''
          + '<div id="foobar">'
          + '  <p id="foobar">Foo</p>'
          + '  <p id="barfoo">bar <em id="barfoo">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["duplicate-ids"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The id 'foobar' appears more than once in the document.")
    expect(log[1].message).toBe("The id 'barfoo' appears more than once in the document.")
    expect(log[0].context).toEqual([html, html.querySelector("p#foobar")])
    expect(log[1].context).toEqual([html.querySelector("p#barfoo"), html.querySelector("em#barfoo")])

  })

  it("doesn't warn when all ids are unique", function() {
    var html = parseHTML(''
          + '<div id="foobar1">'
          + '  <p id="foobar2">Foo</p>'
          + '  <p id="barfoo1">Bar <em id="barfoo2">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["duplicate-ids"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)
  })

})


describe("inline-event-handlers", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when inline event handlers are found on elements", function() {
    var html = parseHTML(''
          + '<div onresize="alert(\'bad!\')">'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#" onclick="alert(\'bad!\')">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["inline-event-handlers"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("An 'onresize' attribute was found in the HTML. Use external scripts for event binding instead.")
    expect(log[1].message).toBe("An 'onclick' attribute was found in the HTML. Use external scripts for event binding instead.")
    expect(log[0].context).toEqual(html)
    expect(log[1].context).toEqual(html.querySelector("a"))

  })

  it("doesn't warn there are no inline event handlers", function() {
    var html = parseHTML(''
          + '<div>'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["inline-event-handlers"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)
  })

})


describe("script-placement", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when script tags aren't found as the last elemenet in <body>", function() {
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      onComplete: onComplete
    })
    expect(log.length).toBeGreaterThan(0)
    log.forEach(function(error, i) {
      expect(log[i].message).toBe("<script> elements should appear right before the closing </body> tag for optimal performance.")
      expect(log[i].context.nodeName.toLowerCase()).toBe("script")
    })

    var body = document.createElement("body")
    body.appendChild(parseHTML('<script id="script1">(function() { // script one }())</script>'))
    body.appendChild(parseHTML('<header>Header content</header>'))
    body.appendChild(parseHTML('<main>Main content</main>'))
    body.appendChild(parseHTML('<footer>Footer content</footer>'))
    body.appendChild(parseHTML('<script id="script2">(function() { // script two }())</script>'))
    body.appendChild(parseHTML('<script id="script3">(function() { // script three }())</script>'))

    // Make sure the scripts aren't async or defer
    Array.prototype.slice.call(body.querySelectorAll("script")).forEach(function(script) {
      script.async = false
      script.defer = false
    })

    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })

    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<script> elements should appear right before the closing </body> tag for optimal performance.")
    expect(log[0].context).toBe(body.querySelector("#script1"))
  })

  it("doesn't warn when script tags are the last traversed element", function() {
    var body = document.createElement("body")
    body.appendChild(parseHTML('<header>Header content</header>'))
    body.appendChild(parseHTML('<main>Main content</main>'))
    body.appendChild(parseHTML('<footer>Footer content</header>'))
    body.appendChild(parseHTML('<script id="script1">(function() { // script one }())</script>'))
    body.appendChild(parseHTML('<script id="script2">(function() { // script two }())</script>'))

    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("doesn't warn when the script uses either the async or defer attribute", function() {
    var body = document.createElement("body")
    body.appendChild(parseHTML('<script id="script1" async>(function() { // script one }())</script>'))
    body.appendChild(parseHTML('<script id="script2" defer>(function() { // script two }())</script>'))
    body.appendChild(parseHTML('<header>Header content</header>'))
    body.appendChild(parseHTML('<main>Main content</main>'))
    body.appendChild(parseHTML('<footer>Footer content</header>'))

    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)

  })

  it("allows for customization by altering the config object", function() {
    var body = document.createElement("body")
    body.appendChild(parseHTML('<script id="script1">(function() { // script one }())</script>'))
    body.appendChild(parseHTML('<script id="script2">(function() { // script two }())</script>'))
    body.appendChild(parseHTML('<header>Header content</header>'))
    body.appendChild(parseHTML('<main>Main content</main>'))
    body.appendChild(parseHTML('<footer>Footer content</header>'))
    body.appendChild(parseHTML('<script id="script3">(function() { // script three }())</script>'))

    // Make sure the scripts aren't async or defer
    Array.prototype.slice.call(body.querySelectorAll("script")).forEach(function(script) {
      script.async = false
      script.defer = false
    })

    // whitelist #script1
    HTMLInspector.rules.extend("script-placement", {
      whitelist: "#script1"
    })
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<script> elements should appear right before the closing </body> tag for optimal performance.")
    expect(log[0].context).toBe(body.querySelector("#script2"))

    // whitelist #script1 and #script2
    HTMLInspector.rules.extend("script-placement", {
      whitelist: ["#script1", "#script2"]
    })
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })
})

describe("unique-elements", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when single-use elements appear on the page more than once", function() {
    var html = parseHTML(''
          + '<div>'
          + '  <div>'
          + '    <title>Foobar</title>'
          + '  </div>'
          + '  <div>'
          + '    <title>Foobar</title>'
          + '  </div>'
          + '  <header>Page Header</header>'
          + '  <header>Page Header</header>'
          + '  <main>Main content</main>'
          + '  <main>More main content</main>'
          + '  <footer>Footer content</header>'
          + '  <footer>Footer content</header>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["unique-elements"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The <title> element may only appear once in the document.")
    expect(log[1].message).toBe("The <main> element may only appear once in the document.")
    expect(log[0].context).toEqual([html.querySelector("title"), html.querySelectorAll("title")[1]])
    expect(log[1].context).toEqual([html.querySelector("main"), html.querySelectorAll("main")[1]])
  })

  it("doesn't warn when single-use elements appear on the page only once", function() {
    var html = parseHTML(''
          + '<html>'
          + '  <head>'
          + '    <title>Foobar</title>'
          + '  </head>'
          + '  <body>'
          + '    <header>Header content</header>'
          + '    <main>Main content</main>'
          + '    <footer>Footer content</header>'
          + '  </body>'
          + '</html>'
        )
    HTMLInspector.inspect({
      useRules: ["unique-elements"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("allows for customization by altering the config object", function() {
    var html = parseHTML(''
          + '<div>'
          + '  <div>'
          + '    <title>Foobar</title>'
          + '  </div>'
          + '  <div>'
          + '    <title>Foobar</title>'
          + '  </div>'
          + '  <header>Page Header</header>'
          + '  <header>Page Header</header>'
          + '  <main>Main content</main>'
          + '  <main>More main content</main>'
          + '  <footer>Footer content</header>'
          + '  <footer>Footer content</header>'
          + '</div>'
        )
    HTMLInspector.rules.extend("unique-elements", {
      elements: ["header", "footer"]
    })
    HTMLInspector.inspect({
      useRules: ["unique-elements"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The <header> element may only appear once in the document.")
    expect(log[1].message).toBe("The <footer> element may only appear once in the document.")
    expect(log[0].context).toEqual([html.querySelector("header"), html.querySelectorAll("header")[1]])
    expect(log[1].context).toEqual([html.querySelector("footer"), html.querySelectorAll("footer")[1]])
  })
})

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

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[1].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[2].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).toBe(html)
    expect(log[1].context).toBe(html.querySelector("span"))
    expect(log[2].context).toBe(html.querySelector("div"))

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

    expect(log.length).toBe(1)
    expect(log[0].message).toBe("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).toBe(html.querySelector("div"))

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

    expect(log.length).toBe(0)

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
    expect(log.length).toBe(1)
    expect(log[0].context).toBe(html.querySelector("span"))

  })

})


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

    expect(log[0].message).toBe("The class 'fizz' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).toBe("The class 'buzz' is used in the HTML but not found in any stylesheet.")
    expect(log[2].message).toBe("The class 'baz' is used in the HTML but not found in any stylesheet.")
    expect(log[0].context).toBe(html)
    expect(log[1].context).toBe(html)
    expect(log[2].context).toBe(html.querySelector("p"))

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

    expect(log.length).toBe(0)

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

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The class 'supports-flexbox' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).toBe("The class 'js-alert' is used in the HTML but not found in any stylesheet.")

    log = []
    // It can also be a list of strings or RegExps
    HTMLInspector.rules.extend("unused-classes", {whitelist: ["fizz", /buz\w/]})

    HTMLInspector.inspect({
      useRules: ["unused-classes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The class 'supports-flexbox' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).toBe("The class 'js-alert' is used in the HTML but not found in any stylesheet.")

  })

})


describe("validate-attributes", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when obsolete attributes of elements appear in the HTML", function() {

    var html = parseHTML(''
          + '<div align="center">'
          + '  <section>'
          + '     <h1>Title</h1>'
          + '     <h2 align="right">Subtitle</h2>'
          + '     <p>foo <br clear="both"> bar</p>'
          + '  </section>'
          + '  <hr color="red">'
          + '  <ul type="foo">'
          + '    <li>blah</li>'
          + '  </ul>'
          + '  <ol type="1">'
          + '    <li>blah</li>'
          + '  </ol>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(5)
    expect(log[0].message).toBe("The 'align' attribute is no longer valid on the <div> element and should not be used.")
    expect(log[0].context).toBe(html)
    expect(log[1].message).toBe("The 'align' attribute is no longer valid on the <h2> element and should not be used.")
    expect(log[1].context).toBe(html.querySelector("h2"))
    expect(log[2].message).toBe("The 'clear' attribute is no longer valid on the <br> element and should not be used.")
    expect(log[2].context).toBe(html.querySelector("br"))
    expect(log[3].message).toBe("The 'color' attribute is no longer valid on the <hr> element and should not be used.")
    expect(log[3].context).toBe(html.querySelector("hr"))
    expect(log[4].message).toBe("The 'type' attribute is no longer valid on the <ul> element and should not be used.")
    expect(log[4].context).toBe(html.querySelector("ul"))

  })

  it("warns when invalid attributes of elements appear in the HTML", function() {

    var html = parseHTML(''
          + '<div foo="bar">'
          + '  <section action="http://example.com">'
          + '     <h1>Title</h1>'
          + '     <h2 cell-padding="1">Subtitle</h2>'
          + '     <p>foo <br blah="true"> bar</p>'
          + '  </section>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(4)
    expect(log[0].message).toBe("'foo' is not a valid attribute of the <div> element.")
    expect(log[0].context).toBe(html)
    expect(log[1].message).toBe("'action' is not a valid attribute of the <section> element.")
    expect(log[1].context).toBe(html.querySelector("section"))
    expect(log[2].message).toBe("'cell-padding' is not a valid attribute of the <h2> element.")
    expect(log[2].context).toBe(html.querySelector("h2"))
    expect(log[3].message).toBe("'blah' is not a valid attribute of the <br> element.")
    expect(log[3].context).toBe(html.querySelector("br"))

  })

  it("warns when required attributes are missing", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <img class="foo" />'
          + '  <form>'
          + '     <textarea><textarea>'
          + '  </form>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(5)
    expect(log[0].message).toBe("The 'alt' attribute is required for <img> elements.")
    expect(log[0].context).toBe(html.querySelector("img"))
    expect(log[1].message).toBe("The 'src' attribute is required for <img> elements.")
    expect(log[1].context).toBe(html.querySelector("img"))
    expect(log[2].message).toBe("The 'action' attribute is required for <form> elements.")
    expect(log[2].context).toBe(html.querySelector("form"))
    expect(log[3].message).toBe("The 'cols' attribute is required for <textarea> elements.")
    expect(log[3].context).toBe(html.querySelector("textarea"))
    expect(log[4].message).toBe("The 'rows' attribute is required for <textarea> elements.")
    expect(log[4].context).toBe(html.querySelector("textarea"))

  })

  it("doesn't double-warn when an attribute is both invalid and obsolete", function() {

    var html = parseHTML(''
          + '<div align="center">'
          + '   <h1>Title</h1>'
          + '   <h2>Subtitle</h2>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(1)
  })

  it("doesn't warn about invalid attributes if the element containing the attribute is invalid", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <foo bar></foo>'
          + '  <fizz buzz="true"></fizz>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)
  })

  it("doesn't warn when valid, non-obsolete elements are used", function() {

    var html = parseHTML(''
          + '<div class="foo" data-foo="bar" role="main">'
          + '  <span id="bar">Foo</span>'
          + '  <a aria-foo="bar" href="#">Foo</a>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

  })


})

describe("validate-element-location", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when elements appear as children of parent elements they're not allow to be within", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <h1>This is a <p>Heading!</p> shit</h1>'
          + '  <span>'
          + '    <ul>'
          + '      <li>foo</li>'
          + '    </ul>'
          + '  </span>'
          + '  <ul>'
          + '    <span><li>Foo</li></span>'
          + '    <li>Bar</li>'
          + '  </ul>'
          + '  <p>This is a <title>title</title> element</p>'
          + '  <em><p>emphasize!</p></em>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(6)
    expect(log[0].message).toBe("The <p> element cannot be a child of the <h1> element.")
    expect(log[0].context).toBe(html.querySelector("h1 > p"))
    expect(log[1].message).toBe("The <ul> element cannot be a child of the <span> element.")
    expect(log[1].context).toBe(html.querySelector("span > ul"))
    expect(log[2].message).toBe("The <span> element cannot be a child of the <ul> element.")
    expect(log[2].context).toBe(html.querySelector("ul > span"))
    expect(log[3].message).toBe("The <li> element cannot be a child of the <span> element.")
    expect(log[3].context).toBe(html.querySelector("span > li"))
    expect(log[4].message).toBe("The <title> element cannot be a child of the <p> element.")
    expect(log[4].context).toBe(html.querySelector("p > title"))
    expect(log[5].message).toBe("The <p> element cannot be a child of the <em> element.")
    expect(log[5].context).toBe(html.querySelector("em > p"))
  })

  it("doesn't warn when elements appear as children of parents they're allowed to be within", function() {
    var html = parseHTML(''
          + '<div>'
          + '  <h1>This is a <strong>Heading!</strong> shit</h1>'
          + '  <p><a href="#"><span></span></a><p>'
          + '  <ol><li><p>li</p></li></ol>'
          + '  <section>'
          + '    <article><h1>Blah</h1><p>This is some text</p></article>'
          + '  </section>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("warns when <style> elements inside body do not declare the scoped attribute", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><style> .foo { } </style></section>'

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<style> elements inside <body> must contain the 'scoped' attribute.")
    expect(log[0].context).toBe(html.querySelector("style"))
  })

  it("doesn't warns when <style> elements are inside the head", function() {
    var html = parseHTML(''
          + '<html>'
          + '  <head>'
          + '    <style scoped> .foo { } </style>'
          + '  </head>'
          + '  <body></body>'
          + '</html>'
        )
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("warns when <style> elements inside body declare the scoped attribute but are not the first child of their parent", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><span>alert</span><style scoped> .foo { } </style></section>'

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(1)
    expect(log[0].message).toBe("Scoped <style> elements must be the first child of their parent element.")
    expect(log[0].context).toBe(html.querySelector("style"))
  })

  it("doesn't warns when <style scoped> elements are the first child of their parent", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><style scoped> .foo { } </style></section>'
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("warns when <link> and <meta> elements inside body do not declare the itemprop attribute", function() {
    var html = document.createElement("body")
    html.innerHTML = '<meta charset="utf-8"><link rel="imports" href="component.html">'
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("<meta> elements inside <body> must contain the 'itemprop' attribute.")
    expect(log[0].context).toBe(html.querySelector("meta"))
    expect(log[1].message).toBe("<link> elements inside <body> must contain the 'itemprop' attribute.")
    expect(log[1].context).toBe(html.querySelector("link"))
  })

  it("doesn't warns when <link> and <meta> elements are inside the head", function() {
    var html = parseHTML(''
          + '<html>'
          + '  <head>'
          + '    <meta charset="utf-8">'
          + '    <link rel="imports" href="component.html">'
          + '  </head>'
          + '  <body></body>'
          + '</html>'
        )
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

})

describe("validate-elements", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when obsolete elements appear in the HTML", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <hgroup>'
          + '     <h1>Title</h1>'
          + '     <h2>Subtitle</h2>'
          + '  </hgroup>'
          + '  <tt>Teletype text</tt>'
          + '  <center><p><b>Foo</b></p></center>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The <hgroup> element is obsolete and should not be used.")
    expect(log[0].context).toBe(html.querySelector("hgroup"))
    expect(log[1].message).toBe("The <tt> element is obsolete and should not be used.")
    expect(log[1].context).toBe(html.querySelector("tt"))
    expect(log[2].message).toBe("The <center> element is obsolete and should not be used.")
    expect(log[2].context).toBe(html.querySelector("center"))

  })

  it("warns when invalid elements appear in the HTML", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <foo>'
          + '     <h1>Title</h1>'
          + '     <h2>Subtitle</h2>'
          + '  </foo>'
          + '  <bar>Teletype text</bar>'
          + '  <bogus><p><b>Foo</b></p></bogus>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The <foo> element is not a valid HTML element.")
    expect(log[0].context).toBe(html.querySelector("foo"))
    expect(log[1].message).toBe("The <bar> element is not a valid HTML element.")
    expect(log[1].context).toBe(html.querySelector("bar"))
    expect(log[2].message).toBe("The <bogus> element is not a valid HTML element.")
    expect(log[2].context).toBe(html.querySelector("bogus"))

  })

  it("doesn't double-warn when an element is both invalid and obsolete", function() {

    var html = parseHTML(''
          + '<hgroup>'
          + '   <h1>Title</h1>'
          + '   <h2>Subtitle</h2>'
          + '</hgroup>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(1)
  })

  it("doesn't warn when valid, non-obsolete elements are used", function() {

    var html = parseHTML(''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

  })

})

})