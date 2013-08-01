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
          inspector,
          listener,
          reporter,
          inspector.rules[rule].config
        )
      }
    })
  }

  function traverseDOM(node, listener, options) {

    // only deal with element nodes
    if (node.nodeType != 1) return

    // trigger events for this element unless it's been excluded
    if (!matches(node, options.exclude)) {
      listener.trigger("element", node, [node.nodeName.toLowerCase(), node])
      if (node.id) {
        listener.trigger("id", node, [node.id, node])
      }
      toArray(node.classList).forEach(function(name) {
        listener.trigger("class", node, [name, node])
      })
      getAttributes(node).forEach(function(attr) {
        listener.trigger("attribute", node, [attr.name, attr.value, node])
      })
    }

    // recurse through the subtree unless it's been excluded
    if (!matches(node, options.excludeSubTree)) {
      toArray(node.childNodes).forEach(function(node) {
        traverseDOM(node, listener, options)
      })
    }
  }

  function processConfig(config) {
    // allow config to be individual properties of the defaults object
    if (config) {
      if (typeof config == "string" || config.nodeType == 1) {
        config = { domRoot: config }
      } else if (Array.isArray(config)) {
        config = { useRules: config }
      } else if (typeof config == "function") {
        config = { onComplete: config }
      }
    }
    // merge config with the defaults
    return extend({}, inspector.config, config)
  }

  /**
   * cross-origin iframe elements throw errors when being
   * logged to the console.
   * This function removes them from the context before
   * logging them to the console.
   */
  function filterCrossOrigin(elements) {
    // convert elements to an array if it's not already
    if (!Array.isArray(elements)) elements = [elements]
    elements = elements.map(function(el) {
      if (el.nodeName.toLowerCase() == "iframe" && isCrossOrigin(el.src))
        return "(iframe " + el.src + ")"
      else
        return el
    })
    return elements.length === 1 ? elements[0] : elements
  }


  var inspector = {

    config: {
      useRules: null,
      domRoot: "html",
      exclude: "svg",
      excludeSubTree: ["svg", "iframe"],
      onComplete: function(errors) {
        errors.forEach(function(error) {
          console.warn(error.message, filterCrossOrigin(error.context))
        })
      }
    },

    setConfig: function(config) {
      inspector.config = processConfig(config)
    },

    rules: new Rules(),

    modules: new Modules(),

    inspect: function(config) {
      var domRoot
        , listener = new Listener()
        , reporter = new Reporter()

      config = processConfig(config)
      domRoot = typeof config.domRoot == "string"
        ? document.querySelector(config.domRoot)
        : config.domRoot

      setup(config.useRules, listener, reporter)

      listener.trigger("beforeInspect", domRoot)
      traverseDOM(domRoot, listener, config)
      listener.trigger("afterInspect", domRoot)

      config.onComplete(reporter.getWarnings())
    },

    // expose the utility functions for use in rules
    utils: {
      toArray: toArray,
      getAttributes: getAttributes,
      isRegExp: isRegExp,
      unique: unique,
      extend: extend,
      foundIn: foundIn,
      isCrossOrigin: isCrossOrigin,
      matchesSelector: matchesSelector,
      matches: matches,
      parents: parents
    }

    /* test-code */
    ,
    _constructors: {
      Listener: Listener,
      Reporter: Reporter,
      Callbacks: Callbacks
    }
    /* end-test-code */
  }

  return inspector

}())
