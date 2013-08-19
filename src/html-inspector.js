var Listener = require("./listener")
  , Modules = require("./modules")
  , Reporter = require("./reporter")
  , Rules = require("./rules")

  , toArray = require("mout/lang/toArray")
  , isRegExp = require("mout/lang/isRegExp")
  , unique = require("mout/array/unique")
  , mixIn = require("mout/object/mixIn")

  , matches = require("dom-utils/src/matches")
  , getAttributes = require("dom-utils/src/get-attributes")

  // used to parse URLs
  , link = document.createElement("a")

/**
 * Set (or reset) all data back to its original value
 * and initialize the specified rules
 */
function setup(listener, reporter) {
  var useRules = HTMLInspector.config.useRules
    , excludeRules = HTMLInspector.config.excludeRules

  rules = useRules == null
    ? Object.keys(HTMLInspector.rules)
    : useRules

  if (excludeRules) {
    rules = rules.filter(function(rule) {
      return excludeRules.indexOf(rule) < 0
    })
  }

  rules.forEach(function(rule) {
    if (HTMLInspector.rules[rule]) {
      HTMLInspector.rules[rule].func.call(
        HTMLInspector,
        listener,
        reporter,
        HTMLInspector.rules[rule].config
      )
    }
  })
}

function traverseDOM(node, listener, options) {

  // only deal with element nodes
  if (node.nodeType != 1) return

  var attrs = getAttributes(node)

  // trigger events for this element unless it's been excluded
  if (!matches(node, options.excludeElements)) {
    listener.trigger("element", node, [node.nodeName.toLowerCase(), node])
    if (node.id) {
      listener.trigger("id", node, [node.id, node])
    }
    toArray(node.classList).forEach(function(name) {
      listener.trigger("class", node, [name, node])
    })
    Object.keys(attrs).sort().forEach(function(name) {
      listener.trigger("attribute", node, [name, attrs[name], node])
    })
  }

  // recurse through the subtree unless it's been excluded
  if (!matches(node, options.excludeSubTrees)) {
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
  return mixIn({}, HTMLInspector.config, config)
}

/**
 * Tests whether a URL is cross-origin
 * Same origin URLs must have the same protocol and host
 * (note: host include hostname and port)
 */
function isCrossOrigin(url) {
  link.href = url
  return !(link.protocol == location.protocol && link.host == location.host)
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
    if (el
      && el.nodeName
      && el.nodeName.toLowerCase() == "iframe"
      && isCrossOrigin(el.src)
    )
      return "(can't display iframe with cross-origin source: " + el.src + ")"
    else
      return el
  })
  return elements.length === 1 ? elements[0] : elements
}


var HTMLInspector = {

  defaults: {
    domRoot: "html",
    useRules: null,
    excludeRules: null,
    excludeElements: "svg",
    excludeSubTrees: ["svg", "iframe"],
    onComplete: function(errors) {
      errors.forEach(function(error) {
        console.warn(error.message, filterCrossOrigin(error.context))
      })
    }
  },

  config: {},

  setConfig: function(config) {
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
    mixIn(this.config, this.defaults, config)
  },

  rules: new Rules(),

  modules: new Modules(),

  inspect: function(config) {
    var domRoot
      , listener = new Listener()
      , reporter = new Reporter()

    this.setConfig(config)
    domRoot = typeof this.config.domRoot == "string"
      ? document.querySelector(this.config.domRoot)
      : this.config.domRoot

    setup(listener, reporter)

    listener.trigger("beforeInspect", domRoot)
    traverseDOM(domRoot, listener, this.config)
    listener.trigger("afterInspect", domRoot)

    this.config.onComplete(reporter.getWarnings())
  }
}

HTMLInspector.modules.add( require("./modules/css.js") )
HTMLInspector.modules.add( require("./modules/validation.js") )

HTMLInspector.rules.add( require("./rules/best-practices/inline-event-handlers.js") )
HTMLInspector.rules.add( require("./rules/best-practices/script-placement.js") )
HTMLInspector.rules.add( require("./rules/best-practices/unnecessary-elements.js") )
HTMLInspector.rules.add( require("./rules/best-practices/unused-classes.js") )
HTMLInspector.rules.add( require("./rules/convention/bem-conventions.js") )
HTMLInspector.rules.add( require("./rules/validation/duplicate-ids.js") )
HTMLInspector.rules.add( require("./rules/validation/unique-elements.js") )
HTMLInspector.rules.add( require("./rules/validation/validate-attributes.js") )
HTMLInspector.rules.add( require("./rules/validation/validate-element-location.js") )
HTMLInspector.rules.add( require("./rules/validation/validate-elements.js") )

module.exports = HTMLInspector
