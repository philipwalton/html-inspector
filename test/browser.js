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

  describe(".setConfig", function() {

    it("merges the passed config options with the defaults", function() {
      var useRules = ["foo", "bar"]
        , domRoot = "body"
        , exclude = "svg, iframe"
        , onComplete = function() {}

      HTMLInspector.setConfig({
        useRules: useRules,
        domRoot: domRoot,
        exclude: exclude,
        onComplete: onComplete
      })
      expect(HTMLInspector.config.useRules).to.equal(useRules)
      expect(HTMLInspector.config.domRoot).to.equal(domRoot)
      expect(HTMLInspector.config.exclude).to.equal(exclude)
      expect(HTMLInspector.config.onComplete).to.equal(onComplete)
      expect(HTMLInspector.config.excludeSubTree).to.equal(HTMLInspector.defaults.excludeSubTree)
    })

    it("accepts a variety of options for the config paramter", function() {
      var div = document.createElement("div")
        , fn = function() { }
      // if it's an array, assume it's the useRules options
      HTMLInspector.setConfig(["dom"])
      expect(HTMLInspector.config.useRules).to.deep.equal(["dom"])
      // if it's a string, assume it's a selector for the domRoot option
      HTMLInspector.inspect("body")
      expect(HTMLInspector.config.domRoot).to.equal("body")
      // if it's a DOM element, assume it's the domRoot option
      HTMLInspector.inspect(div)
      expect(HTMLInspector.config.domRoot).to.equal(div)
      // if it's a function, assume it's the onComplete option
      HTMLInspector.inspect(fn)
      expect(HTMLInspector.config.onComplete).to.equal(fn)
    })
  })

  describe(".inspect", function() {

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
      expect(events).to.deep.equal(["section", "a", "blockquote", "em"])
      events = []
      HTMLInspector.inspect({
        domRoot: html,
        exclude: html.querySelector("blockquote")
      })
      expect(events).to.deep.equal(["section", "h1", "p", "p", "a", "p", "p", "em"])
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
      expect(events).to.deep.equal(["section", "h1", "p", "p", "blockquote", "p", "p"])
      events = []
      HTMLInspector.inspect({
        domRoot: html,
        excludeSubTree: [html.querySelector("p:not(.first)"), html.querySelector("blockquote")]
      })
      expect(events).to.deep.equal(["section", "h1", "p", "p", "blockquote"])
    })

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
      expect(Array.isArray(args)).to.equal(true)
      expect(args).to.deep.equal(["foo", "bar", "baz"])

      var scripts = toArray(document.querySelectorAll("script"))
      expect(Array.isArray(scripts)).to.equal(true)
      expect(scripts.length).to.be.above(0)

      expect(toArray("foo")).to.deep.equal(["f", "o", "o"])

      var div = document.createElement("div")
      div.className = "foo"
      expect(toArray(div.attributes).length).to.deep.equal(1)
    })

    it("returns an empty array if it receives anything it can't turn in to an Array", function() {
      expect(toArray(null)).to.deep.equal([])
      expect(toArray(undefined)).to.deep.equal([])
      expect(toArray({})).to.deep.equal([])
      expect(toArray(4)).to.deep.equal([])
      expect(toArray(document.body)).to.deep.equal([])
    })

  })

  describe("getAttributes", function() {
    var getAttributes = HTMLInspector.utils.getAttributes
    it("returns an array of the element attributes, sorted alphabetically by class name", function() {
      var div = document.createElement("div")
      div.setAttribute("foo", "FOO")
      div.setAttribute("bar", "BAR")
      div.setAttribute("baz", "BAZ")
      expect(getAttributes(div)).to.deep.equal([
        {name: "bar", value: "BAR"},
        {name: "baz", value: "BAZ"},
        {name: "foo", value: "FOO"}
      ])
    })
  })

  describe("isRegExp", function() {
    var isRegExp = HTMLInspector.utils.isRegExp
    it("returns true if the passed object is a Regular Expression", function() {
      expect(isRegExp(/foo/ig)).to.equal(true)
      expect(isRegExp(new RegExp("foo", "g"))).to.equal(true)
      expect(isRegExp("foo")).to.equal(false)
      expect(isRegExp(null)).to.equal(false)
    })
  })

  describe("unique", function() {
    var unique = HTMLInspector.utils.unique
    it("consume an array and return a new array with no duplicate values", function() {
      expect(unique([1,2,2,3,1,4,5,4,5,6,5])).to.deep.equal([1,2,3,4,5,6])
      expect(unique(["foo", "bar", "bar", "bar", "baz", "fo"])).to.deep.equal(["bar", "baz", "fo", "foo"])
    })
  })

  describe("extend", function() {
    var extend = HTMLInspector.utils.extend
    it("extends a given object with all the properties in passed-in object(s)", function() {
      expect(extend({a:1, b:2}, {a:"a"})).to.deep.equal({a:"a", b:2})
      expect(extend({a:1, b:2}, {a:null, c:"c"}, {b:undefined})).to.deep.equal({a:null, b:undefined, c:"c"})
    })
  })


  describe("foundIn", function() {
    var foundIn = HTMLInspector.utils.foundIn
    it("matches a string against a string, RegExp, or list of strings/RegeExps", function() {
      expect(foundIn("foo", "foo")).to.equal(true)
      expect(foundIn("foo", /^fo\w/)).to.equal(true)
      expect(foundIn("foo", [/\d+/, /^fo\w/])).to.equal(true)
      expect(foundIn("foo", ["fo", "f", /foo/])).to.equal(true)
      expect(foundIn("bar", "foo")).to.equal(false)
      expect(foundIn("bar", /^fo\w/)).to.equal(false)
      expect(foundIn("bar", [/\d+/, /^fo\w/])).to.equal(false)
      expect(foundIn("bar", ["fo", "f", /foo/])).to.equal(false)
    })
  })

  describe("isCrossOrigin", function() {
    var isCrossOrigin = HTMLInspector.utils.isCrossOrigin
    it("returns true if the URL is cross-origin (port, protocol, or host don't match)", function() {
      expect(isCrossOrigin("https://google.com")).to.equal(true)
      expect(isCrossOrigin("https://localhost/foobar")).to.equal(true)
      expect(isCrossOrigin("http://localhost:12345/fizzbuzz.html")).to.equal(true)
      // ignore this when running on PhantomJS
      if (location.protocol != "file:")
        expect(isCrossOrigin(location.href)).to.equal(false)
    })
  })

  describe("matchesSelector", function() {
    var matchesSelector = HTMLInspector.utils.matchesSelector
    it("returns true if a DOM element matches a particular selector", function() {
      var div = document.createElement("div")
      div.setAttribute("foo", "FOO")
      expect(matchesSelector(div, "div[foo]")).to.equal(true)
      expect(matchesSelector(div, "div[bar]")).to.equal(false)

      expect(matchesSelector(document.body, "html > body")).to.equal(true)
      expect(matchesSelector(document.body, ".body")).to.equal(false)

      div.innerHTML = "<p id='foo'>foo <em>bar</em></p>"
      expect(matchesSelector(div.querySelector("em"), "#foo > em")).to.equal(true)
      expect(matchesSelector(div.querySelector("em"), "#foo")).to.equal(false)
    })

  })

  describe("matches", function() {
    var matches = HTMLInspector.utils.matches
    it("returns true if a DOM element matches any of the elements or selectors in the test object", function() {

      var div = document.createElement("div")
      div.setAttribute("foo", "FOO")
      expect(matches(div, "div[foo]")).to.equal(true)
      expect(matches(div, "div[bar]")).to.equal(false)

      expect(matches(document.body, ["html", "html > body"])).to.equal(true)
      expect(matches(document.body, [".body", ".html", "p"])).to.equal(false)

      div.innerHTML = "<p id='foo'>foo <em>bar</em></p>"
      expect(matches(div.querySelector("em"), ["#foo", "#foo > em"])).to.equal(true)
      expect(matches(div.querySelector("em"), [document.documentElement, document.body])).to.equal(false)

      expect(matches(div.querySelector("em"), ["#foo", "#foo > em"])).to.equal(true)

      expect(matches(div, null)).to.equal(false)
    })
  })

  describe("parents", function() {
    var parents = HTMLInspector.utils.parents
    it("returns an array of all the parent elements of the passed DOM element", function() {
      var rents
        , div = document.createElement("div")
      expect(parents(div)).to.deep.equal([])

      div.innerHTML = "<p id='foo'><span>foo <em>bar</em><span></p>"
      rents = parents(div.querySelector("em"))
      expect(rents.length).to.equal(3)
      expect(rents[0].nodeName.toLowerCase()).to.equal("span")
      expect(rents[1].nodeName.toLowerCase()).to.equal("p")
      expect(rents[2]).to.equal(div)

      expect(parents(document.querySelector("body > *")).length).to.equal(2)
      expect(parents(document.querySelector("body > *"))[0]).to.equal(document.body)
      expect(parents(document.querySelector("body > *"))[1]).to.equal(document.documentElement)

    })
  })

})
describe("Modules", function() {

describe("css", function() {

  var css = HTMLInspector.modules.css
    , originalStyleSheets = css.styleSheets
    , classes = ["alpha", "bar", "bravo", "charlie", "delta", "echo", "foo", "importee"]

  afterEach(function() {
    css.styleSheets = originalStyleSheets
  })

  it("can filter the searched style sheets via the styleSheets selector", function() {
    css.styleSheets = "#mocha-css"
    var classes = css.getClassSelectors()
    // limiting the style sheets to only mocha.css means
    // .alpha, .bravo, and .charlie won't be there
    expect(classes.indexOf("alpha")).to.equal(-1)
    expect(classes.indexOf("bravo")).to.equal(-1)
    expect(classes.indexOf("charlie")).to.equal(-1)
  })

  it("can get all the class selectors in the style sheets", function() {
    css.styleSheets = 'link[rel="stylesheet"]:not(#mocha-css)'
    expect(css.getClassSelectors()).to.deep.equal(classes)
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

    // first remove any style tags that browser plugins might be putting in
    Array.prototype.slice.call(document.querySelectorAll("style")).forEach(function(el) {
      el.parentNode.removeChild(el)
    })

    head.appendChild(styles)

    css.styleSheets = 'link[rel="stylesheet"]:not(#mocha-css), style'
    expect(css.getClassSelectors()).to.deep.equal(extraClasses)
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
    expect(validation.isElementValid("p")).to.equal(true)
    expect(validation.isElementValid("time")).to.equal(true)
    expect(validation.isElementValid("bogus")).to.equal(false)
    expect(validation.isElementValid("hgroup")).to.equal(false)
  })

  it("can determine if an element is obsolete", function() {
    expect(validation.isElementObsolete("p")).to.equal(false)
    expect(validation.isElementObsolete("bogus")).to.equal(false)
    expect(validation.isElementObsolete("hgroup")).to.equal(true)
    expect(validation.isElementObsolete("blink")).to.equal(true)
    expect(validation.isElementObsolete("center")).to.equal(true)
  })

  it("can determine if an attribute is allowed on an element", function() {
    expect(validation.isAttributeValidForElement("href", "a")).to.equal(true)
    expect(validation.isAttributeValidForElement("aria-foobar", "nav")).to.equal(true)
    expect(validation.isAttributeValidForElement("data-stuff", "section")).to.equal(true)
    expect(validation.isAttributeValidForElement("href", "button")).to.equal(false)
    expect(validation.isAttributeValidForElement("placeholder", "select")).to.equal(false)
  })

  it("can determine if an attribute is obsolute for an element", function() {
    expect(validation.isAttributeObsoleteForElement("align", "div")).to.equal(true)
    expect(validation.isAttributeObsoleteForElement("bgcolor", "body")).to.equal(true)
    expect(validation.isAttributeObsoleteForElement("border", "img")).to.equal(true)
    expect(validation.isAttributeObsoleteForElement("href", "div")).to.equal(false)
    expect(validation.isAttributeObsoleteForElement("charset", "meta")).to.equal(false)
  })

  it("can determine if an attribute is required for an element", function() {
    expect(validation.isAttributeRequiredForElement("src", "img")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("alt", "img")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("action", "form")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("rows", "textarea")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("cols", "textarea")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("id", "div")).to.equal(false)
    expect(validation.isAttributeRequiredForElement("target", "a")).to.equal(false)
  })

  it("can get a list of required attribute given an element", function() {
    expect(validation.getRequiredAttributesForElement("img")).to.deep.equal(["alt", "src"])
    expect(validation.getRequiredAttributesForElement("optgroup")).to.deep.equal(["label"])
    expect(validation.getRequiredAttributesForElement("form")).to.deep.equal(["action"])
    expect(validation.getRequiredAttributesForElement("div")).to.deep.equal([])
  })

  it("can determine if a child elememnt is allowed inside it's parent", function() {
    expect(validation.isChildAllowedInParent("div", "ul")).to.equal(false)
    expect(validation.isChildAllowedInParent("div", "span")).to.equal(false)
    expect(validation.isChildAllowedInParent("section", "em")).to.equal(false)
    expect(validation.isChildAllowedInParent("title", "body")).to.equal(false)
    expect(validation.isChildAllowedInParent("strong", "p")).to.equal(true)
    expect(validation.isChildAllowedInParent("li", "ol")).to.equal(true)
    expect(validation.isChildAllowedInParent("fieldset", "form")).to.equal(true)
    expect(validation.isChildAllowedInParent("td", "tr")).to.equal(true)
  })

  it("ignores elements that are whitelisted", function() {
    validation.elementWhitelist = validation.elementWhitelist.concat(["foo", "bar", "font", "center"])
    // valid elements
    expect(validation.isElementValid("foo")).to.equal(true)
    expect(validation.isElementValid("bar")).to.equal(true)
    // obsolete elements
    expect(validation.isElementObsolete("font")).to.equal(false)
    expect(validation.isElementObsolete("center")).to.equal(false)
  })

  it("ignores attributes that are whitelisted", function() {
    validation.attributeWhitelist = validation.attributeWhitelist.concat(["src", "placeholder", "align", /^bg[a-z]+$/])
    // valid elements
    expect(validation.isAttributeValidForElement("placeholder", "select")).to.equal(true)
    expect(validation.isAttributeValidForElement("ng-model", "div")).to.equal(true)
    // obsolete elements
    expect(validation.isAttributeObsoleteForElement("align", "div")).to.equal(false)
    expect(validation.isAttributeObsoleteForElement("bgcolor", "body")).to.equal(false)
    // required attributes
    expect(validation.isAttributeRequiredForElement("src", "img")).to.equal(false)

  })

})
})

describe("Rules", function() {

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
      expect(config.getBlockName("Block--modifier")).to.equal("Block")
      expect(config.getBlockName("BlockName--someModifier")).to.equal("BlockName")
      expect(config.getBlockName("Block-element")).to.equal("Block")
      expect(config.getBlockName("BlockName-subElement")).to.equal("BlockName")
      expect(config.getBlockName("BlockName-subElement--modifierName")).to.equal("BlockName-subElement")
      expect(config.getBlockName("BlockName")).to.equal(false)
      expect(config.getBlockName("Foo---bar")).to.equal(false)
      expect(config.getBlockName("Foo--bar--baz")).to.equal(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.getBlockName("block--modifier")).to.equal("block")
      expect(config.getBlockName("block-name--some-modifier")).to.equal("block-name")
      expect(config.getBlockName("block__element")).to.equal("block")
      expect(config.getBlockName("block-name__sub-element")).to.equal("block-name")
      expect(config.getBlockName("block-name__sub-element--modifier-name")).to.equal("block-name__sub-element")
      expect(config.getBlockName("block-name")).to.equal(false)
      expect(config.getBlockName("foo---bar")).to.equal(false)
      expect(config.getBlockName("foo--bar__baz")).to.equal(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.getBlockName("block_modifier")).to.equal("block")
      expect(config.getBlockName("block-name_some_modifier")).to.equal("block-name")
      expect(config.getBlockName("block__element")).to.equal("block")
      expect(config.getBlockName("block-name__sub-element")).to.equal("block-name")
      expect(config.getBlockName("block-name__sub-element_modifier_name")).to.equal("block-name__sub-element")
      expect(config.getBlockName("block-name")).to.equal(false)
      expect(config.getBlockName("foo___bar")).to.equal(false)
      expect(config.getBlockName("foo_bar__baz")).to.equal(false)
    })

    it("can determine if a class is a block element class", function() {
      expect(config.isElement("Block-element")).to.equal(true)
      expect(config.isElement("BlockName-elementName")).to.equal(true)
      expect(config.isElement("Block--modifier")).to.equal(false)
      expect(config.isElement("BlockName--modifierName")).to.equal(false)
      expect(config.isElement("Block--modifier-stuffz")).to.equal(false)
      expect(config.isElement("Block--modifier--stuffz")).to.equal(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.isElement("block__element")).to.equal(true)
      expect(config.isElement("block-name__element-name")).to.equal(true)
      expect(config.isElement("block--modifier")).to.equal(false)
      expect(config.isElement("block-name--modifier-name")).to.equal(false)
      expect(config.isElement("block__element__sub-element")).to.equal(false)
      expect(config.isElement("block--modifier--stuffz")).to.equal(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.isElement("block__element")).to.equal(true)
      expect(config.isElement("block-name__element-name")).to.equal(true)
      expect(config.isElement("block_modifier")).to.equal(false)
      expect(config.isElement("block-name_modifier_name")).to.equal(false)
      expect(config.isElement("block__element__sub-element")).to.equal(false)
      expect(config.isElement("block_modifier_stuffz")).to.equal(false)
    })

    it("can determine if a class is a block modifier class", function() {
      expect(config.isModifier("Block--modifier")).to.equal(true)
      expect(config.isModifier("BlockName--modifierName")).to.equal(true)
      expect(config.isModifier("BlockName-elementName--modifierName")).to.equal(true)
      expect(config.isModifier("Block-element")).to.equal(false)
      expect(config.isModifier("BlockName-elementName")).to.equal(false)
      expect(config.isModifier("Block--modifier-stuffz")).to.equal(false)
      expect(config.isModifier("Block--modifier--stuffz")).to.equal(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.isModifier("block--modifier")).to.equal(true)
      expect(config.isModifier("block-name--modifier-name")).to.equal(true)
      expect(config.isModifier("block-name__element-name--modifier-name")).to.equal(true)
      expect(config.isModifier("block__element")).to.equal(false)
      expect(config.isModifier("block-name__element-name")).to.equal(false)
      expect(config.isModifier("block--modifierStuffz")).to.equal(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.isModifier("block_modifier")).to.equal(true)
      expect(config.isModifier("block-name_modifier_name")).to.equal(true)
      expect(config.isModifier("block-name__element-name_modifier_name")).to.equal(true)
      expect(config.isModifier("block__element")).to.equal(false)
      expect(config.isModifier("block-name__element-name")).to.equal(false)
      expect(config.isModifier("block_modifierStuffz")).to.equal(false)
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
    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The BEM element 'BlockTwo-element' must be a descendent of 'BlockTwo'.")
    expect(log[1].message).to.equal("The BEM element 'BlockThree-elementName' must be a descendent of 'BlockThree'.")
    expect(log[0].context).to.equal(html.querySelector(".BlockTwo-element"))
    expect(log[1].context).to.equal(html.querySelector(".BlockThree-elementName"))
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
    expect(log.length).to.equal(0)
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
    expect(log.length).to.equal(3)
    expect(log[0].message).to.equal("The BEM modifier class 'BlockOne--active' was found without the unmodified class 'BlockOne'.")
    expect(log[0].context).to.equal(html)
    expect(log[1].message).to.equal("The BEM modifier class 'BlockTwo--validName' was found without the unmodified class 'BlockTwo'.")
    expect(log[1].context).to.equal(html.querySelector(".BlockTwo--validName"))
    expect(log[2].message).to.equal("The BEM modifier class 'Block-element--modified' was found without the unmodified class 'Block-element'.")
    expect(log[2].context).to.equal(html.querySelector(".Block-element--modified"))
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
    expect(log.length).to.equal(0)
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
    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The BEM modifier class 'block-two---valid-name' was found without the unmodified class 'block-two'.")
    expect(log[1].message).to.equal("The BEM element 'block-three___element-name' must be a descendent of 'block-three'.")
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

    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The id 'foobar' appears more than once in the document.")
    expect(log[1].message).to.equal("The id 'barfoo' appears more than once in the document.")
    expect(log[0].context).to.deep.equal([html, html.querySelector("p#foobar")])
    expect(log[1].context).to.deep.equal([html.querySelector("p#barfoo"), html.querySelector("em#barfoo")])

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

    expect(log.length).to.equal(0)
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

    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("An 'onresize' attribute was found in the HTML. Use external scripts for event binding instead.")
    expect(log[1].message).to.equal("An 'onclick' attribute was found in the HTML. Use external scripts for event binding instead.")
    expect(log[0].context).to.deep.equal(html)
    expect(log[1].context).to.deep.equal(html.querySelector("a"))

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

    expect(log.length).to.equal(0)
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
    expect(log.length).to.be.above(0)
    log.forEach(function(error, i) {
      expect(log[i].message).to.equal("<script> elements should appear right before the closing </body> tag for optimal performance.")
      expect(log[i].context.nodeName.toLowerCase()).to.equal("script")
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

    expect(log.length).to.equal(1)
    expect(log[0].message).to.equal("<script> elements should appear right before the closing </body> tag for optimal performance.")
    expect(log[0].context).to.equal(body.querySelector("#script1"))
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
    expect(log.length).to.equal(0)
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
    expect(log.length).to.equal(0)

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
    expect(log.length).to.equal(1)
    expect(log[0].message).to.equal("<script> elements should appear right before the closing </body> tag for optimal performance.")
    expect(log[0].context).to.equal(body.querySelector("#script2"))

    // whitelist #script1 and #script2
    HTMLInspector.rules.extend("script-placement", {
      whitelist: ["#script1", "#script2"]
    })
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).to.equal(0)
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
    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The <title> element may only appear once in the document.")
    expect(log[1].message).to.equal("The <main> element may only appear once in the document.")
    expect(log[0].context).to.deep.equal([html.querySelector("title"), html.querySelectorAll("title")[1]])
    expect(log[1].context).to.deep.equal([html.querySelector("main"), html.querySelectorAll("main")[1]])
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
    expect(log.length).to.equal(0)
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
    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The <header> element may only appear once in the document.")
    expect(log[1].message).to.equal("The <footer> element may only appear once in the document.")
    expect(log[0].context).to.deep.equal([html.querySelector("header"), html.querySelectorAll("header")[1]])
    expect(log[1].context).to.deep.equal([html.querySelector("footer"), html.querySelectorAll("footer")[1]])
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

    expect(log.length).to.equal(3)
    expect(log[0].message).to.equal("Do not use <div> or <span> elements without any attributes.")
    expect(log[1].message).to.equal("Do not use <div> or <span> elements without any attributes.")
    expect(log[2].message).to.equal("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).to.equal(html)
    expect(log[1].context).to.equal(html.querySelector("span"))
    expect(log[2].context).to.equal(html.querySelector("div"))

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

    expect(log.length).to.equal(1)
    expect(log[0].message).to.equal("Do not use <div> or <span> elements without any attributes.")
    expect(log[0].context).to.equal(html.querySelector("div"))

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

    expect(log.length).to.equal(0)

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
    expect(log.length).to.equal(1)
    expect(log[0].context).to.equal(html.querySelector("span"))

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

    expect(log[0].message).to.equal("The class 'fizz' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).to.equal("The class 'buzz' is used in the HTML but not found in any stylesheet.")
    expect(log[2].message).to.equal("The class 'baz' is used in the HTML but not found in any stylesheet.")
    expect(log[0].context).to.equal(html)
    expect(log[1].context).to.equal(html)
    expect(log[2].context).to.equal(html.querySelector("p"))

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

    expect(log.length).to.equal(0)

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

    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The class 'supports-flexbox' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).to.equal("The class 'js-alert' is used in the HTML but not found in any stylesheet.")

    log = []
    // It can also be a list of strings or RegExps
    HTMLInspector.rules.extend("unused-classes", {whitelist: ["fizz", /buz\w/]})

    HTMLInspector.inspect({
      useRules: ["unused-classes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The class 'supports-flexbox' is used in the HTML but not found in any stylesheet.")
    expect(log[1].message).to.equal("The class 'js-alert' is used in the HTML but not found in any stylesheet.")

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
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["validate-attributes"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(5)
    expect(log[0].message).to.equal("The 'align' attribute is no longer valid on the <div> element and should not be used.")
    expect(log[0].context).to.equal(html)
    expect(log[1].message).to.equal("The 'align' attribute is no longer valid on the <h2> element and should not be used.")
    expect(log[1].context).to.equal(html.querySelector("h2"))
    expect(log[2].message).to.equal("The 'clear' attribute is no longer valid on the <br> element and should not be used.")
    expect(log[2].context).to.equal(html.querySelector("br"))
    expect(log[3].message).to.equal("The 'color' attribute is no longer valid on the <hr> element and should not be used.")
    expect(log[3].context).to.equal(html.querySelector("hr"))
    expect(log[4].message).to.equal("The 'type' attribute is no longer valid on the <ul> element and should not be used.")
    expect(log[4].context).to.equal(html.querySelector("ul"))

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

    expect(log.length).to.equal(4)
    expect(log[0].message).to.equal("'foo' is not a valid attribute of the <div> element.")
    expect(log[0].context).to.equal(html)
    expect(log[1].message).to.equal("'action' is not a valid attribute of the <section> element.")
    expect(log[1].context).to.equal(html.querySelector("section"))
    expect(log[2].message).to.equal("'cell-padding' is not a valid attribute of the <h2> element.")
    expect(log[2].context).to.equal(html.querySelector("h2"))
    expect(log[3].message).to.equal("'blah' is not a valid attribute of the <br> element.")
    expect(log[3].context).to.equal(html.querySelector("br"))

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

    expect(log.length).to.equal(5)
    expect(log[0].message).to.equal("The 'alt' attribute is required for <img> elements.")
    expect(log[0].context).to.equal(html.querySelector("img"))
    expect(log[1].message).to.equal("The 'src' attribute is required for <img> elements.")
    expect(log[1].context).to.equal(html.querySelector("img"))
    expect(log[2].message).to.equal("The 'action' attribute is required for <form> elements.")
    expect(log[2].context).to.equal(html.querySelector("form"))
    expect(log[3].message).to.equal("The 'cols' attribute is required for <textarea> elements.")
    expect(log[3].context).to.equal(html.querySelector("textarea"))
    expect(log[4].message).to.equal("The 'rows' attribute is required for <textarea> elements.")
    expect(log[4].context).to.equal(html.querySelector("textarea"))

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

    expect(log.length).to.equal(1)
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

    expect(log.length).to.equal(0)
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

    expect(log.length).to.equal(0)

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

    expect(log.length).to.equal(6)
    expect(log[0].message).to.equal("The <p> element cannot be a child of the <h1> element.")
    expect(log[0].context).to.equal(html.querySelector("h1 > p"))
    expect(log[1].message).to.equal("The <ul> element cannot be a child of the <span> element.")
    expect(log[1].context).to.equal(html.querySelector("span > ul"))
    expect(log[2].message).to.equal("The <span> element cannot be a child of the <ul> element.")
    expect(log[2].context).to.equal(html.querySelector("ul > span"))
    expect(log[3].message).to.equal("The <li> element cannot be a child of the <span> element.")
    expect(log[3].context).to.equal(html.querySelector("span > li"))
    expect(log[4].message).to.equal("The <title> element cannot be a child of the <p> element.")
    expect(log[4].context).to.equal(html.querySelector("p > title"))
    expect(log[5].message).to.equal("The <p> element cannot be a child of the <em> element.")
    expect(log[5].context).to.equal(html.querySelector("em > p"))
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
    expect(log.length).to.equal(0)
  })

  it("warns when <style> elements inside body do not declare the scoped attribute", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><style> .foo { } </style></section>'

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(1)
    expect(log[0].message).to.equal("<style> elements inside <body> must contain the 'scoped' attribute.")
    expect(log[0].context).to.equal(html.querySelector("style"))
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
    expect(log.length).to.equal(0)
  })

  it("warns when <style> elements inside body declare the scoped attribute but are not the first child of their parent", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><span>alert</span><style scoped> .foo { } </style></section>'

    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(1)
    expect(log[0].message).to.equal("Scoped <style> elements must be the first child of their parent element.")
    expect(log[0].context).to.equal(html.querySelector("style"))
  })

  it("doesn't warns when <style scoped> elements are the first child of their parent", function() {
    var html = document.createElement("body")
    html.innerHTML = '<section><style scoped> .foo { } </style></section>'
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(0)
  })

  it("warns when <link> and <meta> elements inside body do not declare the itemprop attribute", function() {
    var html = document.createElement("body")
    html.innerHTML = '<meta charset="utf-8"><link rel="imports" href="component.html">'
    HTMLInspector.inspect({
      useRules: ["validate-element-location"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("<meta> elements inside <body> must contain the 'itemprop' attribute.")
    expect(log[0].context).to.equal(html.querySelector("meta"))
    expect(log[1].message).to.equal("<link> elements inside <body> must contain the 'itemprop' attribute.")
    expect(log[1].context).to.equal(html.querySelector("link"))
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
    expect(log.length).to.equal(0)
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

    expect(log.length).to.equal(3)
    expect(log[0].message).to.equal("The <hgroup> element is obsolete and should not be used.")
    expect(log[0].context).to.equal(html.querySelector("hgroup"))
    expect(log[1].message).to.equal("The <tt> element is obsolete and should not be used.")
    expect(log[1].context).to.equal(html.querySelector("tt"))
    expect(log[2].message).to.equal("The <center> element is obsolete and should not be used.")
    expect(log[2].context).to.equal(html.querySelector("center"))

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

    expect(log.length).to.equal(3)
    expect(log[0].message).to.equal("The <foo> element is not a valid HTML element.")
    expect(log[0].context).to.equal(html.querySelector("foo"))
    expect(log[1].message).to.equal("The <bar> element is not a valid HTML element.")
    expect(log[1].context).to.equal(html.querySelector("bar"))
    expect(log[2].message).to.equal("The <bogus> element is not a valid HTML element.")
    expect(log[2].context).to.equal(html.querySelector("bogus"))

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

    expect(log.length).to.equal(1)
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

    expect(log.length).to.equal(0)

  })

})
})
