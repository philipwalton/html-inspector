describe("obsolete-attributes", function() {

  var log
    , obsoluteAttributesMap = [
        { attrs: ["rev","charset"], elements: ["link","a"] },
        { attrs: ["shape","coords"], elements: ["a"] },
        { attrs: ["longdesc"], elements: ["img","iframe"] },
        { attrs: ["target"], elements: ["link"] },
        { attrs: ["nohref"], elements: ["area"] },
        { attrs: ["profile"], elements: ["head"] },
        { attrs: ["version"], elements: ["html"] },
        { attrs: ["name"], elements: ["img"] },
        { attrs: ["scheme"], elements: ["meta"] },
        { attrs: ["archive","classid","codebase","codetype","declare","standby"], elements: ["object"] },
        { attrs: ["valuetype","type"], elements: ["param"] },
        { attrs: ["axis","abbr"], elements: ["td","th"] },
        { attrs: ["scope"], elements: ["td"] },
        { attrs: ["summary"], elements: ["table"] },
        // presentational attributes
        { attrs: ["align"], elements: ["caption","iframe","img","input","object","legend","table","hr","div","h1","h2","h3","h4","h5","h6","p","col","colgroup","tbody","td","tfoot","th","thead","tr"] },
        { attrs: ["alink","link","text","vlink"], elements: ["body"] },
        { attrs: ["background"], elements: ["body"] },
        { attrs: ["bgcolor"], elements: ["table","tr","td","th","body"] },
        { attrs: ["border"], elements: ["object"] },
        { attrs: ["cellpadding","cellspacing"], elements: ["table"] },
        { attrs: ["char","charoff"], elements: ["col","colgroup","tbody","td","tfoot","th","thead","tr"] },
        { attrs: ["clear"], elements: ["br"] },
        { attrs: ["compact"], elements: ["dl","menu","ol","ul"] },
        { attrs: ["frame"], elements: ["table"] },
        { attrs: ["frameborder"], elements: ["iframe"] },
        { attrs: ["height"], elements: ["td","th"] },
        { attrs: ["hspace","vspace"], elements: ["img","object"] },
        { attrs: ["marginheight","marginwidth"], elements: ["iframe"] },
        { attrs: ["noshade"], elements: ["hr"] },
        { attrs: ["nowrap"], elements: ["td","th"] },
        { attrs: ["rules"], elements: ["table"] },
        { attrs: ["scrolling"], elements: ["iframe"] },
        { attrs: ["size"], elements: ["hr"] },
        { attrs: ["type"], elements: ["li","ul"] },
        { attrs: ["valign"], elements: ["col","colgroup","tbody","td","tfoot","th","thead","tr"] },
        { attrs: ["width"], elements: ["hr","table","td","th","col","colgroup","pre"] }
      ]

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when obsolete element attributes appear in the HTML", function() {
    var $html = $(document.createElement("div"))
      , count = 0
    obsoluteAttributesMap.forEach(function(item) {
      item.elements.forEach(function(element) {
        var $el = $(document.createElement(element))
        item.attrs.forEach(function(attr) {
          count++
          $el.attr(attr, "")
        })
        $html.append($el)
      })
    })

    HTMLInspector.inspect({
      rules: ["obsolete-attributes"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(count)

    count = 0
    obsoluteAttributesMap.forEach(function(item) {
      item.elements.forEach(function(element) {
        item.attrs.forEach(function(attr) {
          expect(log[count].message).toBe("The '" + attr + "' attribute of the '" + element + "' element is obsolete and should not be used.")
          expect(log[count].context).toBe($html.find(element + "["+attr+"]")[0])
          count++
        })
      })
    })

  })

  it("doesn't warn when non-obsolete element attributes are used", function() {

    var $html = $(''
          + '<div class="foo">'
          + '  <span id="bar">Foo</span>'
          + '  <p title="p">Foo</p>'
          + '  <div data-foo-bar><b style="display:none;">Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["obsolete-elements"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)

  })

})
