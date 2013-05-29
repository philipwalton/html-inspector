var HTMLInspector = (function() {

  /**
   * Set (or reset) all data back to its original value
   * and initialize the specified rules
   */
  function setup(useRules, listener, reporter) {
    useRules = (useRules == "all")
      ? Object.keys(inspector.rules)
      : useRules
    useRules.forEach(function(rule) {
      if (inspector.rules[rule]) {
        inspector.rules[rule].call(inspector, listener, reporter)
      }
    })
  }

  function traverseDOM(root, listener) {
    var $root = $(root)
      , $dom = $root.add($root.find("*"))
    listener.trigger("beforeInspect", inspector.config.domRoot)
    $dom.each(function() {
      var el = this
      listener.trigger("element", el, [el.nodeName.toLowerCase(), el])
      if (el.id) {
        listener.trigger("id", el, [el.id, el])
      }
      toArray(el.classList).forEach(function(name) {
        listener.trigger("class", el, [name, el])
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
        config = { rules: config }
      } else if (typeof config == "function") {
        config = { complete: config }
      }
    }
    // merge config with the defaults
    return $.extend({}, inspector.config, config)
  }

  var inspector = {

    config: {
      rules: "all",
      domRoot: "html",
      complete: function(errors) {
        errors.forEach(function(error) {
          console.warn(error.message, error.context)
        })
      }
    },

    rules: {},

    extensions: {},

    addRule: function(name, fn) {
      inspector.rules[name] = fn
    },

    addExtension: function(name, obj) {
      inspector.extensions[name] = obj
    },

    inspect: function(config) {
      var listener = new Listener()
        , reporter = new Reporter()
      config = processConfig(config)
      setup(config.rules, listener, reporter)
      traverseDOM(config.domRoot, listener)
      config.complete(reporter.getErrors())
    }

  }

  // mixin the observable module
  return inspector

}())