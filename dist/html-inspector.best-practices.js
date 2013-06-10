HTMLInspector.rules.add("inline-event-handlers", function(listener, reporter) {

  listener.on('attribute', function(name, value) {
    if (name.indexOf("on") === 0) {
      reporter.warn(
        "inline-event-handlers",
        "An '" + name + "' attribute was found in the HTML. Use external scripts for event binding instead.",
        this
      )
    }
  })

})

HTMLInspector.rules.add(
  "script-placement",
  {
    whitelist: []
  },
  function(listener, reporter) {

    var elements = []
      , whitelist = this.whitelist

    function isWhitelisted(el) {
      if (!whitelist) return false
      if (typeof whitelist == "string") return $(el).is(whitelist)
      if (Array.isArray(whitelist)) {
        return whitelist.length && whitelist.some(function(item) {
          return $(el).is(item)
        })
      }
      return false
    }

    listener.on("element", function(name) {
      elements.push(this)
    })

    listener.on("afterInspect", function() {
      var el
      // scripts at the end of the elements are safe
      while (el = elements.pop()) {
        if (el.nodeName.toLowerCase() != "script") break
      }
      elements.forEach(function(el) {
        if (el.nodeName.toLowerCase() == "script" && !isWhitelisted(el)) {
          reporter.warn(
            "script-placement",
            "<script> elements should appear right before "
            + "the closing </body> tag for optimal performance.",
            el
          )
        }
      })
    })
  }
)

HTMLInspector.rules.add(
  "unnecessary-elements",
  {
    isUnnecessary: function(element) {
      var name = element.nodeName.toLowerCase()
        , isUnsemantic = name == "div" || name == "span"
        , isAttributed = element.attributes.length === 0
      return isUnsemantic && isAttributed
    }
  },
  function(listener, reporter, config) {
    listener.on('element', function(name) {
      if (config.isUnnecessary(this)) {
        reporter.warn(
          "unnecessary-elements",
          "Do not use <div> or <span> elements without any attributes.",
          this
        )
      }
    }
  )
})

HTMLInspector.rules.add(
  "unused-classes",
  {
    whitelist: /^js\-|^supports\-|^language\-|^lang\-/
  },
  function(listener, reporter, config) {

    var css = HTMLInspector.modules.css
      , classes = css.getClassSelectors()

    listener.on('class', function(name) {
      if (!config.whitelist.test(name) && classes.indexOf(name) == -1) {
        reporter.warn(
          "unused-classes",
          "The class '"
          + name
          + "' is used in the HTML but not found in any stylesheet.",
          this
        )
      }
    }
  )
})