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