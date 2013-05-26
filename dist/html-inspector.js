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
    , events = {}
    , reports = []

  /**
   * Set (or reset) all data back to its original value
   * and initialize the specified rules
   */
  function init(useRules) {
    useRules = (useRules == "all") ? Object.keys(rules) : useRules
    useRules.forEach(function(rule) {
      rules[rule] && rules[rule].init.call(HTMLInspector)
    })
  }

  /**
   * Destroy all variables to allow for additional inspections
   */
  function teardown() {
    events = {}
    reports = []
  }

  function traverseDOM(root) {
    HTMLInspector.trigger("beforeInspect", HTMLInspector)
    $(root).find("*").each(function() {
      var el = this
      HTMLInspector.trigger("element", HTMLInspector, [el])
      if (el.id) {
        HTMLInspector.trigger("id", HTMLInspector, [id, name])
      }
      toArray(el.classList).forEach(function(name) {
        HTMLInspector.trigger("class", HTMLInspector, [name, el])
      })
    })
    HTMLInspector.trigger("afterInspect", HTMLInspector)
  }

  return {

    config: {
      rules: "all",
      domRoot: document,
      complete: function(reports) {
        reports.forEach(function(report) {
          console.warn(report.message, report.context)
        })
      }
    },

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

      init(config.rules)
      traverseDOM(config.domRoot)
      config.complete(reports)
      teardown()
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
      return classes.concat(getClassesFromRuleList(toArray(sheet.cssRules)))
    }, [])
  }

  function getStyleSheets() {
    return toArray(document.styleSheets).filter(function(sheet) {
      return $(sheet.ownerNode).is(styleSheets.filter)
    })
  }

  var styleSheets = {
    getClassSelectors: function() {
      return unique(getClassesFromStyleSheets(getStyleSheets()))
    },
    getSelectors: function() {
      return []
    },
    filter: 'link[rel="stylesheet"], style'
  }

  return { styleSheets: styleSheets }

}())
  // expose HTMLInspector globally
  window.HTMLInspector = $.extend(HTMLInspector, styleSheets)

}(this, jQuery, document))

HTMLInspector.addRule({
  id: "nonsemantic-elements",
  init: function() {
    this.on('element', function(el) {
      var isUnsemantic = el.nodeName == "DIV" || el.nodeName == "SPAN"
        , isAttributed = el.attributes.length === 0
      if (isUnsemantic && isAttributed) {
        this.report(
          "nonsemantic-elements",
          "Do not use <div> or <span> elements without any attributes",
          el
        )
      }
    });
  }
});
HTMLInspector.addRule({
  id: "unused-classes",
  init: function() {
    var whitelist = /^js\-|^supports\-|^language\-|^lang\-/
      , classes = this.styleSheets.getClassSelectors()

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