var Callbacks = require("./callbacks")
  , Listener = require("./listener")
  , Modules = require("./modules")
  , Reporter = require("./reporter")
  , Rules = require("./rules")

  // TODO: this is ugly, refactor
  , utils = require("./utils")
  , slice = utils.slice
  , toArray = utils.toArray
  , getAttributes = utils.getAttributes
  , isRegExp = utils.isRegExp
  , unique = utils.unique
  , extend = utils.extend
  , foundIn = utils.foundIn
  , isCrossOrigin = utils.isCrossOrigin
  , matchesSelector = utils.matchesSelector
  , matches = utils.matches
  , parents = utils.parents


/**
 * Set (or reset) all data back to its original value
 * and initialize the specified rules
 */
function setup(useRules, listener, reporter) {
  useRules = useRules == null
    ? Object.keys(HTMLInspector.rules)
    : useRules
  useRules.forEach(function(rule) {
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
  return extend({}, HTMLInspector.config, config)
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
      return "(can't display iframe with cross-origin source)"
    else
      return el
  })
  return elements.length === 1 ? elements[0] : elements
}


var HTMLInspector = {

  defaults: {
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
    extend(this.config, this.defaults, config)
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

    setup(this.config.useRules, listener, reporter)

    listener.trigger("beforeInspect", domRoot)
    traverseDOM(domRoot, listener, this.config)
    listener.trigger("afterInspect", domRoot)

    this.config.onComplete(reporter.getWarnings())
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
