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