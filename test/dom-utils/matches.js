var matches = require("../src/utils/dom/matches")

describe("matches", function() {
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
