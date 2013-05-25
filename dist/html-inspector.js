/*!
 * HTML Inspector - v0.1.0
 *
 * Copyright (c) 2013 Philip Walton <http://philipwalton.com>
 * Released under the MIT license
 *
 * Date: 2013-05-25
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
var HTMLInspector = (function() {

  var rules = {}
    , reports = []
    , callback

  function initializeRules(useRules) {
    HTMLInspector.resetEvents()
    useRules = (useRules == "all") ? Object.keys(rules) : useRules
    useRules.forEach(function(rule) {
      rules[rule] && rules[rule].init.call(HTMLInspector)
    })
  }

  function beforeInspect() {
    HTMLInspector.trigger("beforeInspect", HTMLInspector)
  }

  function afterInspect() {
    HTMLInspector.trigger("afterInspect", HTMLInspector)
  }

  function traverseDOM(root) {
    $(root).find("*").each(function() {
      var el = this
      element(el)
      el.id && id(el.id, el)
      toArray(el.classList).forEach(function(name) {
        cls(name, el)
      })
    })
  }

  function element(el) {
    HTMLInspector.trigger("element", HTMLInspector, [el])
  }

  function cls(name, el) {
    HTMLInspector.trigger("class", HTMLInspector, [name, el])
  }

  function id(id, el) {
    HTMLInspector.trigger("id", HTMLInspector, [id, name])
  }

  /**
   * the default reporting if no done callback is specified
   */
  function warn(reports) {
    reports.forEach(function(report) {
      console.warn(report.message, report.context)
    })
  }

  return {

    config: {
      rules: "all",
      domRoot: document,
      timeout: 1, // needed to all synchronous tasks to finish first
      styleSheets: $('link[rel="stylesheet"], style')
    },

    addRule: function(rule) {
      rules[rule.id] = rule
    },

    report: function(rule, message, context) {
      reports.push({
        rule: rule,
        message: message,
        context: context
      })
    },

    inspect: function(config) {
      // config can be options or a DOM/$ element
      if (!$.isPlainObject(config)) config = { domRoot: config }

      // merge config with the defaults
      config = $.extend({}, HTMLInspector.config, config)

      // reset reports and callback in case this is a second run
      reports = []
      callback = null

      setTimeout(function() {

        initializeRules(config.rules)
        beforeInspect()
        traverseDOM(config.domRoot)
        afterInspect()

        // default to logging the results to the console
        // if no done callback has been set
        var done = typeof callback == "function" ? callback : warn
        done.call(HTMLInspector, reports)

      }, HTMLInspector.config.timeout)
    },

    done: function(fn) {
      callback = fn
    }

  }

}())

var observable = (function() {

  var events = {}

  return {
    on: function(event, fn) {
      events[event] || (events[event] = $.Callbacks())
      events[event].add(fn)
    },
    off: function(event, fn) {
      events[event] && events[event].remove(fn)
    },
    trigger: function(event, context, args) {
      events[event] && events[event].fireWith(context, args )
    },
    resetEvents: function() {
      events = {}
    }
  }

}())
var styleSheets = (function(config) {

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
      if (sheet.href) {
        return getClassesFromRuleList(toArray(sheet.cssRules))
      }
      return classes
    }, [])
  }

  function getStyleSheets() {
    return toArray(document.styleSheets).filter(function(sheet) {
      return config.styleSheets.is(sheet.ownerNode)
    })
  }

  return {
    sheetSheets: {
      getClassSelectors: function() {
        return unique(getClassesFromStyleSheets(getStyleSheets()))
      },
      getSelectors: function() {
        return []
      }
    }
  }

}(HTMLInspector.config))
  // expose HTMLInspector globally
  window.HTMLInspector = $.extend(HTMLInspector, observable, styleSheets)

}(this, jQuery, document))

HTMLInspector.addRule({
  id: "unsemantic-elements",
  type: "error",
  init: function() {
    this.on('element', function(el) {
      var isUnsemantic = el.nodeName == "DIV" || el.nodeName == "SPAN"
        , isAttributed = el.attributes.length === 0
      if (isUnsemantic && isAttributed) {
        this.report(
          "unsemantic-elements",
          "Do not use <div> or <span> elements without any attributes",
          el
        )
      }
    });
  }
});
HTMLInspector.addRule({
  id: "unused-classes",
  type: "error",
  init: function() {
    var whitelist = /^js\-|^supports\-|^language\-|^lang\-/
      , classes = this.sheetSheets.getClassSelectors()

    this.on('class', function(cls, el) {
      if (!whitelist.test(cls) && classes.indexOf(cls) == -1) {
        this.report(
          "unused-classes",
          "The class '"
          + cls
          + "' is used in the HTML but not found in any stylesheet",
          el
        )
      }
    });
  }
});