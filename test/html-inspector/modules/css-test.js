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
    expect(css.getClassSelectors().sort()).to.deep.equal(classes)
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
    expect(css.getClassSelectors().sort()).to.deep.equal(extraClasses)
    head.removeChild(styles)
  })

})
