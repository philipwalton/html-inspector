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
