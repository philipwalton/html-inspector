module.exports = {

  name: "validate-element-location",

  config: {
    whitelist: []
  },

  func: function(listener, reporter, config) {

    var validation = this.modules.validation
      , matches = require("dom-utils/src/matches")
      , parents = require("dom-utils/src/parents")
      , warned = [] // store already-warned elements to prevent double warning


    // ===========================================================================
    // Elements with clear-cut location rules are tested here.
    // More complicated cases are tested below
    // ===========================================================================

    function testGeneralElementLocation(name) {
      var child = name
        , parent = this.parentNode.nodeName.toLowerCase()

      if (!validation.isChildAllowedInParent(child, parent)) {
        warned.push(this)
        reporter.warn(
          "validate-element-location",
          "The <" + child + "> element cannot be a child of the <" + parent + "> element.",
          this
        )
      }
    }

    // ===========================================================================
    // Make sure <style> elements inside <body> have the 'scoped' attribute.
    // They must also be the first element child of their parent.
    // ===========================================================================

    function testUnscopedStyles(name) {
      if (matches(this, "body style:not([scoped])")) {
        reporter.warn(
          "validate-element-location",
          "<style> elements inside <body> must contain the 'scoped' attribute.",
          this
        )
      }
      else if (matches(this, "body style[scoped]:not(:first-child)")) {
        reporter.warn(
          "validate-element-location",
          "Scoped <style> elements must be the first child of their parent element.",
          this
        )
      }
    }

    // ===========================================================================
    // Make sure <meta> and <link> elements inside <body> have the 'itemprop'
    // attribute
    // ===========================================================================

    function testItemProp(name) {
      if (matches(this, "body meta:not([itemprop]), body link:not([itemprop])")) {
        reporter.warn(
          "validate-element-location",
          "<" + name + "> elements inside <body> must contain the"
          + " 'itemprop' attribute.",
          this
        )
      }
    }


    listener.on("element", function(name) {

      // ignore whitelisted elements
      if (matches(this, config.whitelist)) return

      // skip elements without a DOM element for a parent
      if (!(this.parentNode && this.parentNode.nodeType == 1)) return

      // don't double warn if the elements already has a location warning
      if (warned.indexOf(this) > -1) return

      testGeneralElementLocation.call(this, name)
      testUnscopedStyles.call(this, name)
      testItemProp.call(this, name)
    })

  }
}
