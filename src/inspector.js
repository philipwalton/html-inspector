var HTMLInspector = (function() {

  var listener
    , reporter

  /**
   * Set (or reset) all data back to its original value
   * and initialize the specified rules
   */
  function setup(useRules) {
    listener = new Listener()
    reporter = new Reporter()

    useRules = (useRules == "all")
      ? Object.keys(inspector.rules)
      : useRules
    useRules.forEach(function(rule) {
      if (inspector.rules[rule]) {
        inspector.rules[rule].call(inspector, listener, reporter)
      }
    })
  }

  /**
   * Return the inspector to its original state so it can run again
   */
  function teardown() {
    listener = null
    reporter = null
  }

  function traverseDOM(root) {
    listener.trigger("beforeInspect", inspector.config.domRoot)
    $(root).find("*").each(function() {
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

  var inspector = {

    config: {
      rules: "all",
      domRoot: document,
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
      // config can be options or a DOM/$ element
      if (!$.isPlainObject(config)) config = { domRoot: config }

      // merge config with the defaults
      config = $.extend({}, inspector.config, config)

      setup(config.rules)
      traverseDOM(config.domRoot)
      config.complete(reporter.getErrors())
      teardown()
    }

  }

  // mixin the observable module
  return inspector

}())