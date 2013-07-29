var parents = require("../src/utils/dom/parents")

describe("parents", function() {
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