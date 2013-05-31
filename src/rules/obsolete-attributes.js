HTMLInspector.addRule("obsolete-attributes", function(listener, reporter) {

  // http://www.w3.org/TR/html5-diff/#obsolete-attributes
  var obsoluteAttributesMap = [
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

  listener.on("attribute", function(name) {
    var el = this
      , nodeName = el.nodeName.toLowerCase()
    obsoluteAttributesMap.forEach(function(item) {
      if (
        item.attrs.indexOf(name) > -1
        && item.elements.indexOf(nodeName) > -1
      ) {
        reporter.addError(
          "obsolete-attributes",
          "The '" + name + "' attribute of the '" + nodeName + "' element is obsolete and should not be used.",
          el
        )
      }
    })
  })

})