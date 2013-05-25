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
