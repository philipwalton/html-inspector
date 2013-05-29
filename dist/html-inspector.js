/*!
 * HTML Inspector - v0.1.0
 *
 * Copyright (c) 2013 Philip Walton <http://philipwalton.com>
 * Released under the MIT license
 *
 * Date: 2013-05-28
 */
;(function(root, $, document) {

function toArray(arrayLike) {
  return [].slice.call(arrayLike)
}

/**
 * Consume an array and return a new array with no duplicate values
 */
function unique(array) {
  var uniq = []
  array = array.sort()
  array.forEach(function(val, i) {
    val !== array[i-1] && uniq.push(val)
  })
  return uniq
}

function Listener() {
  this._events = {}
}

Listener.prototype.on = function(event, fn) {
  this._events[event] || (this._events[event] = $.Callbacks())
  this._events[event].add(fn)
}

Listener.prototype.off = function(event, fn) {
  this._events[event] && this._events[event].remove(fn)
}

Listener.prototype.trigger = function(event, context, args) {
  this._events[event] && this._events[event].fireWith(context, args)
}

function Reporter() {
  this._errors = []
}

Reporter.prototype.addError = function(rule, message, context) {
  this._errors.push({
    rule: rule,
    message: message,
    context: context
  })
}

Reporter.prototype.getErrors = function() {
  return this._errors
}

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

HTMLInspector.addExtension("css", (function(config) {

  var reClassSelector = /\.[a-z0-9_\-]+/ig

  /**
   * Get an array of class selectors from a CSSRuleList object
   */
  function getClassesFromRuleList(rulelist) {
    return rulelist.reduce(function(classes, rule) {
      var matches
      if (rule.cssRules) {
        return classes.concat(getClassesFromRuleList(toArray(rule.cssRules)))
      }
      if (rule.selectorText) {
        matches = rule.selectorText.match(reClassSelector) || []
        return classes.concat(matches.map(function(cls) { return cls.slice(1) } ))
      }
      return classes
    }, [])
  }

  /**
   * Get an array of class selectors from a CSSSytleSheetList object
   */
  function getClassesFromStyleSheets(styleSheets) {
    return styleSheets.reduce(function(classes, sheet) {
      return classes.concat(getClassesFromRuleList(toArray(sheet.cssRules)))
    }, [])
  }

  function getStyleSheets() {
    return toArray(document.styleSheets).filter(function(sheet) {
      return $(sheet.ownerNode).is(css.styleSheets)
    })
  }

  var css = {
    getClassSelectors: function() {
      return unique(getClassesFromStyleSheets(getStyleSheets()))
    },
    // getSelectors: function() {
    //   return []
    // },
    styleSheets: 'link[rel="stylesheet"], style'
  }

  return css

}()))

HTMLInspector.addRule("nonsemantic-elements", function(listener, reporter) {

  listener.on('element', function(name) {
    var isUnsemantic = name == "div" || name == "span"
      , isAttributed = this.attributes.length === 0
    if (isUnsemantic && isAttributed) {
      reporter.addError(
        "nonsemantic-elements",
        "Do not use <div> or <span> elements without any attributes",
        this
      )
    }
  })

})

HTMLInspector.addRule("unused-classes", function(listener, reporter) {

  var whitelist = /^js\-|^supports\-|^language\-|^lang\-/
    , classes = this.extensions.css.getClassSelectors()

  listener.on('class', function(name) {
    if (!whitelist.test(name) && classes.indexOf(name) == -1) {
      reporter.addError(
        "unused-classes",
        "The class '"
        + name
        + "' is used in the HTML but not found in any stylesheet",
        this
      )
    }
  })

})

  // expose HTMLInspector globally
  window.HTMLInspector = HTMLInspector

}(this, jQuery, document))