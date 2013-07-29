var getAttributes = require("../src/utils/dom/get-attributes")

describe("getAttributes", function() {
  it("returns an array of the element attributes, sorted alphabetically by class name", function() {
    var div = document.createElement("div")
    div.setAttribute("foo", "FOO")
    div.setAttribute("bar", "BAR")
    div.setAttribute("baz", "BAZ")
    expect(getAttributes(div)).to.deep.equal({
      "bar": "BAR",
      "baz": "BAZ",
      "foo": "FOO"
    })
  })
})
