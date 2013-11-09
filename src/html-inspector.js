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

  , isCrossOrigin = require("./utils/cross-origin")

/**
 * Set (or reset) all data back to its original value
 * and initialize the specified rules
 */
function setup(listener, reporter, useRules, excludeRules) {
  var rules = useRules == null
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

function traverseDOM(listener, node, excludeElements, excludeSubTrees) {

  // only deal with element nodes
  if (node.nodeType != 1) return

  var attrs = getAttributes(node)

  // trigger events for this element unless it's been excluded
  if (!matches(node, excludeElements)) {
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
  if (!matches(node, excludeSubTrees)) {
    toArray(node.childNodes).forEach(function(node) {
      traverseDOM(listener, node, excludeElements, excludeSubTrees)
    })
  }
}

function mergeOptions(options) {
  // allow config to be individual properties of the defaults object
  if (options) {
    if (typeof options == "string" || options.nodeType == 1) {
      options = { domRoot: options }
    } else if (Array.isArray(options)) {
      options = { useRules: options }
    } else if (typeof options == "function") {
      options = { onComplete: options }
    }
  }

  // merge options with the defaults
  options = mixIn({}, HTMLInspector.defaults, options)

  // set the domRoot to an HTMLElement if it's not
  options.domRoot = typeof options.domRoot == "string"
    ? document.querySelector(options.domRoot)
    : options.domRoot

  return options
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

  rules: new Rules(),

  modules: new Modules(),

  inspect: function(options) {
    var config = mergeOptions(options)
      , listener = new Listener()
      , reporter = new Reporter()

    setup(listener, reporter, config.useRules, config.excludeRules)

    listener.trigger("beforeInspect", config.domRoot)
    traverseDOM(listener, config.domRoot, config.excludeElements, config.excludeSubTrees)
    listener.trigger("afterInspect", config.domRoot)

    config.onComplete(reporter.getWarnings())
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
