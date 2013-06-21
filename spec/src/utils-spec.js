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