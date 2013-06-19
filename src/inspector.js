var HTMLInspector = (function() {

  /**
   * Set (or reset) all data back to its original value
   * and initialize the specified rules
   */
  function setup(useRules, listener, reporter) {
    useRules = useRules == null
      ? Object.keys(inspector.rules)
      : useRules
    useRules.forEach(function(rule) {
      if (inspector.rules[rule]) {
        inspector.rules[rule].fn.call(
          inspector.rules[rule].config,
          listener,
          reporter,
          inspector.rules[rule].config
        )
      }
    })
  }

  function traverseDOM(root, listener) {
    var $root = $(root)
      , $dom = $root.add($root.find("*"))

    // ignore SVG elements and their descendents until the SVG spec is added
    $dom = $dom.not("svg, svg *")

    listener.trigger("beforeInspect", inspector.config.domRoot)
    $dom.each(function() {
      var el = this

      // don't inspect text nodes
      if (this.nodeType == 3) return

      listener.trigger("element", el, [el.nodeName.toLowerCase(), el])
      if (el.id) {
        listener.trigger("id", el, [el.id, el])
      }
      toArray(el.classList).forEach(function(name) {
        listener.trigger("class", el, [name, el])
      })
      getAttributes(el).forEach(function(attr) {
        listener.trigger("attribute", el, [attr.name, attr.value, el])
      })
    })
    listener.trigger("afterInspect", inspector.config.domRoot)
  }

  function processConfig(config) {
    // allow config to be individual properties of the defaults object
    if (config) {
      if (typeof config == "string"
        || config.nodeType == 1
        || config instanceof $)
      {
        config = { domRoot: config }
      } else if (Array.isArray(config)) {
        config = { useRules: config }
      } else if (typeof config == "function") {
        config = { onComplete: config }
      }
    }
    // merge config with the defaults
    return $.extend({}, inspector.config, config)
  }

  var inspector = {

    config: {
      useRules: null,
      domRoot: "html",
      onComplete: function(errors) {
        errors.forEach(function(error) {
          console.warn(error.message, error.context)
        })
      }
    },

    rules: new Rules(),

    modules: new Modules(),

    inspect: function(config) {
      var listener = new Listener()
        , reporter = new Reporter()
      config = processConfig(config)
      setup(config.useRules, listener, reporter)
      traverseDOM(config.domRoot, listener)
      config.onComplete(reporter.getWarnings())
    },

    // expose for testing only
    _constructors: {
      Listener: Listener,
      Reporter: Reporter,
      Callbacks: Callbacks
    }

  }



  return inspector

}())