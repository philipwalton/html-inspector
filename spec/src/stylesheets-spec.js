describe("stylesheets", function() {

  var originalFilter = HTMLInspector.styleSheets.filter
    , classes = ["alpha", "bar", "bravo", "charlie", "delta", "echo", "foo"]

  afterEach(function() {
    HTMLInspector.styleSheets.filter = originalFilter
  })

  it("adds the styleSheets object as a property on HTMLInspector", function() {
    expect(HTMLInspector.styleSheets).toBeDefined()
  })

  it("can filter the searched style sheets via the filter option", function() {
    HTMLInspector.styleSheets.filter = "link[href$='jasmine.css']"
    var classes = HTMLInspector.styleSheets.getClassSelectors()
    // limiting the style sheets to only jasmine.css means
    // .alpha, .bravo, and .charlie won't be there
    expect(classes.indexOf("alpha")).toEqual(-1)
    expect(classes.indexOf("bravo")).toEqual(-1)
    expect(classes.indexOf("charlie")).toEqual(-1)
  })

  it("can get all the class selectors in the style sheets", function() {
    HTMLInspector.styleSheets.filter = "link[href$='-spec.css']"
    expect(HTMLInspector.styleSheets.getClassSelectors()).toEqual(classes)
  })

  it("can include both <link> and <style> elements", function() {
    var extraClasses = classes.concat(["style", "fizz", "buzz"]).sort()
    $("head").append(""
      + "<style id='style'>"
      + ".style .foo, .style .bar { visiblility: visible }"
      + ".style .fizz, .style .buzz { visiblility: visible }"
      + "</style>"
    )
    HTMLInspector.styleSheets.filter = "link[href$='-spec.css'], style"
    expect(HTMLInspector.styleSheets.getClassSelectors()).toEqual(extraClasses)
    $("#style").remove()
  })

})
