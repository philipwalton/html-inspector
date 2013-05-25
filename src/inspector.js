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
      styleSheets: $('link[rel="stylesheet"], style'),
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
