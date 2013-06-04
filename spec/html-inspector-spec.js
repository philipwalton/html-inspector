describe("HTMLInspector", function() {

  var originalRules = HTMLInspector.rules
    , originalModules = HTMLInspector.modules

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
      domRoot: "<p>foobar</p>",
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
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
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
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
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
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
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
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
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
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
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
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
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
      HTMLInspector.rules.add("traverse-test", function(listener, reporter) {
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
    HTMLInspector.rules.add("listener", function(listener) {
      Listener = listener.constructor
    })
    HTMLInspector.inspect({
      useRules: ["listener"],
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
    HTMLInspector.rules.add("reporter", function(reporter, reporter) {
      Reporter = reporter.constructor
    })
    HTMLInspector.inspect({
      useRules: ["reporter"],
      domRoot: document.createElement("div")
    })
    HTMLInspector.rules = originalRules
    return Reporter
  }

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
    // first remove any style tags browser modules might be putting in
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
describe("validation", function() {

  var validation = HTMLInspector.modules.validation

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


})
})
describe("Rules", function() {

  it("can add a new rule", function() {
    HTMLInspector.rules.add("new-rule", $.noop)
    expect(HTMLInspector.rules["new-rule"]).toBeDefined()
    ;delete HTMLInspector.rules["new-rule"]
  })

  it("can extend an existing rule with an options object", function() {
    var config = {foo: "bar"}
    HTMLInspector.rules.add("new-rule", config, $.noop)
    HTMLInspector.rules.extend("new-rule", {fizz: "buzz"})
    expect(HTMLInspector.rules["new-rule"].config).toEqual({foo:"bar", fizz:"buzz"})
    ;delete HTMLInspector.rules["new-rule"]
  })

  it("can extend an existing rule with a function that returns an options object", function() {
    var config = {list: [1]}
    HTMLInspector.rules.add("new-rule", config, $.noop)
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
    var $html = $(''
          + '<div class="BlockOne SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-elementName">three</em></p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM element 'BlockTwo-element' must be a descendent of 'BlockTwo'.")
    expect(log[1].message).toBe("The BEM element 'BlockThree-elementName' must be a descendent of 'BlockThree'.")
    expect(log[0].context).toBe($html.find(".BlockTwo-element")[0])
    expect(log[1].context).toBe($html.find(".BlockThree-elementName")[0])
  })

  it("doesn't warn when a BEM element class is used as the descendent of a block", function() {
    var $html = $(''
          + '<div class="BlockThree BlockTwo SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-elementName">three</em></p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("warns when a BEM modifier class is used without the unmodified block or element class", function() {
    var $html = $(''
          + '<div class="BlockOne--active">'
          + '  <p class="BlockTwo--validName BlockThree SomeOtherBlock">Foo</p>'
          + '  <p class="Block-element--modified">Bar</p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The BEM modifier class 'BlockOne--active' was found without the unmodified class 'BlockOne'.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].message).toBe("The BEM modifier class 'BlockTwo--validName' was found without the unmodified class 'BlockTwo'.")
    expect(log[1].context).toBe($html.find(".BlockTwo--validName")[0])
    expect(log[2].message).toBe("The BEM modifier class 'Block-element--modified' was found without the unmodified class 'Block-element'.")
    expect(log[2].context).toBe($html.find(".Block-element--modified")[0])
  })

  it("doesn't warn when a BEM modifier is used along with the unmodified block or element class", function() {
    var $html = $(''
          + '<div class="BlockOne BlockOne--active">'
          + '  <p class="BlockTwo BlockTwo--validName SomeOtherBlock">Foo</p>'
          + '  <p>Bar</p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("allows for customization by altering the config object", function() {
    var $html = $(''
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
      domRoot: $html,
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
    var $html = $(''
          + '<div id="foobar">'
          + '  <p id="foobar">Foo</p>'
          + '  <p id="barfoo">Bar <em id="barfoo">Em</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["duplicate-ids"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The id 'foobar' appears more than once in the document.")
    expect(log[1].message).toBe("The id 'barfoo' appears more than once in the document.")
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
      useRules: ["duplicate-ids"],
      domRoot: $html,
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
    var $html = $(''
          + '<div onresize="alert(\'bad!\')">'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#" onclick="alert(\'bad!\')">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["inline-event-handlers"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("An 'onresize' attribute was found in the HTML. Use external scripts for event binding instead.")
    expect(log[1].message).toBe("An 'onclick' attribute was found in the HTML. Use external scripts for event binding instead.")
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
      useRules: ["inline-event-handlers"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)
  })

})

describe("scoped-styles", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when style elements outside of the head do not declare the scoped attribute", function() {
    var $html = $(''
          + '<section>'
          + '  <style> .foo { } </style>'
          + '</section>'
        )

    HTMLInspector.inspect({
      useRules: ["scoped-styles"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<style> elements outside of <head> must declare the 'scoped' attribute.")
    expect(log[0].context).toBe($html.find("style")[0])

  })

  it("doesn't warns when style elements outside of the head declare the scoped attribute", function() {
    var $html = $(''
          + '<section>'
          + '  <style scoped> .foo { } </style>'
          + '</section>'
        )

    HTMLInspector.inspect({
      useRules: ["scoped-styles"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

  })

  it("doesn't warns when style elements are inside the head", function() {
    var $html = $(''
          + '<html>'
          + '  <head>'
          + '    <style scoped> .foo { } </style>'
          + '  </head>'
          + '  <body></body>'
          + '</html>'
        )

    HTMLInspector.inspect({
      useRules: ["scoped-styles"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

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
    var $html = $(''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["unnecessary-elements"],
      domRoot: $html,
      onComplete: onComplete
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
      useRules: ["unnecessary-elements"],
      domRoot: $html,
      onComplete: onComplete
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
      useRules: ["unnecessary-elements"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

  })

  it("allows for customization by altering the config object", function() {
    var $html = $(''
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
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(1)
    expect(log[0].context).toBe($html.find("span")[0])

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
    var $html = $(''
          + '<div class="fizz buzz">'
          + '  <p class="foo bar baz">This is just a test</p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["unused-classes"],
      domRoot: $html,
      onComplete: onComplete
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
      useRules: ["unused-classes"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

  })

  it("allows for customization by altering the config object", function() {

    var $html = $(''
          + '<div class="foo supports-flexbox">'
          + '  <p class="js-alert bar">This is just a test</p>'
          + '</div>'
        )

    HTMLInspector.rules.extend("unused-classes", {whitelist: /foo|bar/})

    HTMLInspector.inspect({
      useRules: ["unused-classes"],
      domRoot: $html,
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

    var $html = $(''
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
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(5)
    expect(log[0].message).toBe("The 'align' attribute is no longer valid on the <div> element and should not be used.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].message).toBe("The 'align' attribute is no longer valid on the <h2> element and should not be used.")
    expect(log[1].context).toBe($html.find("h2")[0])
    expect(log[2].message).toBe("The 'clear' attribute is no longer valid on the <br> element and should not be used.")
    expect(log[2].context).toBe($html.find("br")[0])
    expect(log[3].message).toBe("The 'color' attribute is no longer valid on the <hr> element and should not be used.")
    expect(log[3].context).toBe($html.find("hr")[0])
    expect(log[4].message).toBe("The 'type' attribute is no longer valid on the <ul> element and should not be used.")
    expect(log[4].context).toBe($html.find("ul")[0])

  })

  it("warns when invalid attributes of elements appear in the HTML", function() {

    var $html = $(''
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
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(4)
    expect(log[0].message).toBe("'foo' is not a valid attribute of the <div> element.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].message).toBe("'action' is not a valid attribute of the <section> element.")
    expect(log[1].context).toBe($html.find("section")[0])
    expect(log[2].message).toBe("'cell-padding' is not a valid attribute of the <h2> element.")
    expect(log[2].context).toBe($html.find("h2")[0])
    expect(log[3].message).toBe("'blah' is not a valid attribute of the <br> element.")
    expect(log[3].context).toBe($html.find("br")[0])

  })

  it("warns when required attributes are missing", function() {

    var $html = $(''
          + '<div>'
          + '  <img class="foo" />'
          + '  <form>'
          + '     <textarea><textarea>'
          + '  </form>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(5)
    expect(log[0].message).toBe("The 'alt' attribute is required for <img> elements.")
    expect(log[0].context).toBe($html.find("img")[0])
    expect(log[1].message).toBe("The 'src' attribute is required for <img> elements.")
    expect(log[1].context).toBe($html.find("img")[0])
    expect(log[2].message).toBe("The 'action' attribute is required for <form> elements.")
    expect(log[2].context).toBe($html.find("form")[0])
    expect(log[3].message).toBe("The 'cols' attribute is required for <textarea> elements.")
    expect(log[3].context).toBe($html.find("textarea")[0])
    expect(log[4].message).toBe("The 'rows' attribute is required for <textarea> elements.")
    expect(log[4].context).toBe($html.find("textarea")[0])

  })

  it("doesn't double-warn when an element is both invalid and obsolete", function() {

    var $html = $(''
          + '<div align="center">'
          + '   <h1>Title</h1>'
          + '   <h2>Subtitle</h2>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(1)
  })

  it("doesn't warn when valid, non-obsolete elements are used", function() {

    var $html = $(''
          + '<div class="foo" data-foo="bar" role="main">'
          + '  <span id="bar">Foo</span>'
          + '  <a aria-foo="bar" href="#">Foo</a>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: $html,
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

    var $html = $(''
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
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The <hgroup> element is obsolete and should not be used.")
    expect(log[0].context).toBe($html.find("hgroup")[0])
    expect(log[1].message).toBe("The <tt> element is obsolete and should not be used.")
    expect(log[1].context).toBe($html.find("tt")[0])
    expect(log[2].message).toBe("The <center> element is obsolete and should not be used.")
    expect(log[2].context).toBe($html.find("center")[0])

  })

  it("warns when invalid elements appear in the HTML", function() {

    var $html = $(''
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
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The <foo> element is not a valid HTML element.")
    expect(log[0].context).toBe($html.find("foo")[0])
    expect(log[1].message).toBe("The <bar> element is not a valid HTML element.")
    expect(log[1].context).toBe($html.find("bar")[0])
    expect(log[2].message).toBe("The <bogus> element is not a valid HTML element.")
    expect(log[2].context).toBe($html.find("bogus")[0])

  })

  it("doesn't double-warn when an element is both invalid and obsolete", function() {

    var $html = $(''
          + '<hgroup>'
          + '   <h1>Title</h1>'
          + '   <h2>Subtitle</h2>'
          + '</hgroup>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(1)
  })

  it("doesn't warn when valid, non-obsolete elements are used", function() {

    var $html = $(''
          + '<div>'
          + '  <span>Foo</span>'
          + '  <p>Foo</p>'
          + '  <div><b>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-elements"],
      domRoot: $html,
      onComplete: onComplete
    })

    expect(log.length).toBe(0)

  })

})
})