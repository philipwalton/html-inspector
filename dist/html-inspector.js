/*!
 * HTML Inspector - v0.1.0
 *
 * Copyright (c) 2013 Philip Walton <http://philipwalton.com>
 * Released under the MIT license
 *
 * Date: 2013-05-30
 */
;(function(root, $, document) {

function toArray(arrayLike) {
  return arrayLike ? [].slice.call(arrayLike) : []
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
      toArray(el.attributes).forEach(function(attr) {
        listener.trigger("attribute", el, [attr.name, attr.value])
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

HTMLInspector.addExtension("bem", (function() {

  var reModifier = /^[A-Z][a-zA-Z]*\-\-[a-zA-Z]+$/
    , reElement = /^[A-Z][a-zA-Z]*\-[a-zA-Z]+$/
    , reElementOrModifier = /^([A-Z][a-zA-Z]*)\-\-?[a-zA-Z]+$/

  return {

    getBlockName: function(elementOrModifier) {
      return reElementOrModifier.test(elementOrModifier) && RegExp.$1
    },

    isBlockModifier: function(cls) {
      return reModifier.test(cls)
    },

    isBlockElement: function(cls) {
      return reElement.test(cls)
    }

  }

}()))

HTMLInspector.addExtension("css", (function() {

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
    styleSheets: 'link[rel="stylesheet"], style',
    whitelist: /^js\-|^supports\-|^language\-|^lang\-/
  }

  return css

}()))

HTMLInspector.addRule("bem-misused-elements", function(listener, reporter) {

  var bem = this.extensions.bem

  listener.on('class', function(name) {
    if (bem.isBlockElement(name)) {
      // check the ancestors for the block class
      if (!$(this).parents().is("." + bem.getBlockName(name))) {
        reporter.addError(
          "bem-misused-modifier",
          "The BEM element '" + name
          + "' must be a descendent of '" + bem.getBlockName(name)
          + "'.",
          this
        )
      }
    }
  })

})

HTMLInspector.addRule("bem-misused-modifiers", function(listener, reporter) {

  var bem = this.extensions.bem

  listener.on('class', function(name) {
    if (bem.isBlockModifier(name)) {
      if (!$(this).is("." + bem.getBlockName(name))) {
        reporter.addError(
          "bem-misused-modifiers",
          "The BEM modifier class '" + name
          + "' was found without the block base class '" + bem.getBlockName(name)
          +  "'.",
          this
        )
      }
    }
  })

})

HTMLInspector.addRule("duplicate-ids", function(listener, reporter) {

  var elements = []

  listener.on("id", function(name) {
    elements.push({id: name, context: this})
  })

  listener.on("afterInspect", function() {

    var duplicates = []
      , element
      , offenders

    while (element = elements.shift()) {
      // find other elements with the same ID
      duplicates = elements.filter(function(el) {
        return element.id === el.id
      })
      // remove elements with the same ID from the elements array
      elements = elements.filter(function(el) {
        return element.id !== el.id
      })
      // report duplicates
      if (duplicates.length) {
        offenders = [element.context].concat(duplicates.map(function(dup) {
          return dup.context
        }))
        reporter.addError(
          "duplicate-ids",
          "The id '" + element.id + "' appears more than once in the HTML.",
          offenders
        )
      }
    }


  })

})

HTMLInspector.addRule("inline-event-handlers", function(listener, reporter) {

  listener.on('attribute', function(name, value) {
    if (name.indexOf("on") === 0) {
      reporter.addError(
        "inline-event-handlers",
        "The '" + name + "' event handler was found inline in the HTML.",
        this
      )
    }
  })

})

HTMLInspector.addRule("misused-attributes", function(listener, reporter) {

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
  // TODO: this list is most likely incomplete
  // I've commented out some of the things I know aren't correct
  var attributeMap = [
        { attr: "accept", elements: ["form", "input"] },
        { attr: "accept-charset", elements: ["form"] },
        { attr: "action", elements: ["form"] },
        // { attr: "align", elements: ["applet", "caption", "col", "colgroup", "hr", "iframe", "img", "table", "tbody", "td", "tfoot , th", "thead", "tr"] },
        { attr: "alt", elements: ["applet", "area", "img", "input"] },
        { attr: "async", elements: ["script"] },
        { attr: "autocomplete", elements: ["form", "input"] },
        { attr: "autofocus", elements: ["button", "input", "keygen", "select", "textarea"] },
        { attr: "autoplay", elements: ["audio", "video"] },
        // { attr: "bgcolor", elements: ["body", "col", "colgroup", "marquee", "table", "tbody", "tfoot", "td", "th", "tr"] },
        // { attr: "border", elements: ["img", "object", "table"] },
        { attr: "buffered", elements: ["audio", "video"] },
        { attr: "challenge", elements: ["keygen"] },
        { attr: "charset", elements: ["meta", "script"] },
        { attr: "checked", elements: ["command", "input"] },
        { attr: "cite", elements: ["blockquote", "del", "ins", "q"] },
        { attr: "code", elements: ["applet"] },
        { attr: "codebase", elements: ["applet"] },
        // { attr: "color", elements: ["basefont", "font", "hr"] },
        { attr: "cols", elements: ["textarea"] },
        { attr: "colspan", elements: ["td", "th"] },
        { attr: "content", elements: ["meta"] },
        { attr: "controls", elements: ["audio", "video"] },
        { attr: "coords", elements: ["area"] },
        { attr: "data", elements: ["object"] },
        { attr: "datetime", elements: ["del", "ins", "time"] },
        { attr: "default", elements: ["track"] },
        { attr: "defer", elements: ["script"] },
        { attr: "dirname", elements: ["input", "textarea"] },
        { attr: "disabled", elements: ["button", "command", "fieldset", "input", "keygen", "optgroup", "option", "select", "textarea"] },
        { attr: "download", elements: ["a", "area"] },
        { attr: "enctype", elements: ["form"] },
        { attr: "for", elements: ["label", "output"] },
        { attr: "form", elements: ["button", "fieldset", "input", "keygen", "label", "meter", "object", "output", "progress", "select", "textarea"] },
        { attr: "headers", elements: ["td", "th"] },
        { attr: "height", elements: ["canvas", "embed", "iframe", "img", "input", "object", "video"] },
        { attr: "high", elements: ["meter"] },
        { attr: "href", elements: ["a", "area", "base", "link"] },
        { attr: "hreflang", elements: ["a", "area", "link"] },
        { attr: "http-equiv", elements: ["meta"] },
        { attr: "icon", elements: ["command"] },
        { attr: "ismap", elements: ["img"] },
        { attr: "keytype", elements: ["keygen"] },
        { attr: "kind", elements: ["track"] },
        { attr: "label", elements: ["track"] },
        { attr: "language", elements: ["script"] },
        { attr: "list", elements: ["input"] },
        { attr: "loop", elements: ["audio", "bgsound", "marquee", "video"] },
        { attr: "low", elements: ["meter"] },
        { attr: "manifest", elements: ["html"] },
        { attr: "max", elements: ["input", "meter", "progress"] },
        { attr: "maxlength", elements: ["input", "textarea"] },
        { attr: "media", elements: ["a", "area", "link", "source", "style"] },
        { attr: "method", elements: ["form"] },
        { attr: "min", elements: ["input", "meter"] },
        { attr: "multiple", elements: ["input", "select"] },
        { attr: "name", elements: ["button", "form", "fieldset", "iframe", "input", "keygen", "object", "output", "select", "textarea", "map", "meta", "param"] },
        { attr: "novalidate", elements: ["form"] },
        { attr: "open", elements: ["details"] },
        { attr: "optimum", elements: ["meter"] },
        { attr: "pattern", elements: ["input"] },
        { attr: "ping", elements: ["a", "area"] },
        { attr: "placeholder", elements: ["input", "textarea"] },
        { attr: "poster", elements: ["video"] },
        { attr: "preload", elements: ["audio", "video"] },
        { attr: "pubdate", elements: ["time"] },
        { attr: "radiogroup", elements: ["command"] },
        { attr: "readonly", elements: ["input", "textarea"] },
        { attr: "rel", elements: ["a", "area", "link"] },
        { attr: "required", elements: ["input", "select", "textarea"] },
        { attr: "reversed", elements: ["ol"] },
        { attr: "rows", elements: ["textarea"] },
        { attr: "rowspan", elements: ["td", "th"] },
        { attr: "sandbox", elements: ["iframe"] },
        { attr: "scope", elements: ["th"] },
        { attr: "scoped", elements: ["style"] },
        { attr: "seamless", elements: ["iframe"] },
        { attr: "selected", elements: ["option"] },
        { attr: "shape", elements: ["a", "area"] },
        { attr: "size", elements: ["input", "select"] },
        { attr: "sizes", elements: ["link"] },
        { attr: "span", elements: ["col", "colgroup"] },
        { attr: "src", elements: ["audio", "embed", "iframe", "img", "input", "script", "source", "track", "video"] },
        { attr: "srcdoc", elements: ["iframe"] },
        { attr: "srclang", elements: ["track"] },
        { attr: "start", elements: ["ol"] },
        { attr: "step", elements: ["input"] },
        { attr: "summary", elements: ["table"] },
        { attr: "target", elements: ["a", "area", "base", "form"] },
        { attr: "type", elements: ["button", "input", "command", "embed", "object", "script", "source", "style", "menu"] },
        { attr: "usemap", elements: ["img", "input", "object"] },
        { attr: "value", elements: ["button", "option", "input", "li", "meter", "progress", "param"] },
        { attr: "width", elements: ["canvas", "embed", "iframe", "img", "input", "object", "video"] },
        { attr: "wrap", elements: ["textarea"] }
      ]

  listener.on("attribute", function(name) {
    var el = this
      , nodeName = el.nodeName.toLowerCase()
    attributeMap.forEach(function(item) {
      if (
        name === item.attr
        && item.elements.indexOf(nodeName) < 0
      ) {
        reporter.addError(
          "misused-attributes",
          "The '" + name + "' attribute cannot be used on a '" + nodeName + "' element.",
          el
        )
      }
    })
  })

})

HTMLInspector.addRule("nonsemantic-elements", function(listener, reporter) {

  listener.on('element', function(name) {
    var isUnsemantic = name == "div" || name == "span"
      , isAttributed = this.attributes.length === 0
    if (isUnsemantic && isAttributed) {
      reporter.addError(
        "nonsemantic-elements",
        "Do not use <div> or <span> elements without any attributes.",
        this
      )
    }
  })

})

HTMLInspector.addRule("obsolete-attributes", function(listener, reporter) {

  // http://www.w3.org/TR/html5-diff/#obsolete-attributes
  var obsoluteAttributesMap = [
    { attrs: ["rev","charset"], elements: ["link","a"] },
    { attrs: ["shape","coords"], elements: ["a"] },
    { attrs: ["longdesc"], elements: ["img","iframe"] },
    { attrs: ["target"], elements: ["link"] },
    { attrs: ["nohref"], elements: ["area"] },
    { attrs: ["profile"], elements: ["head"] },
    { attrs: ["version"], elements: ["html"] },
    { attrs: ["name"], elements: ["img"] },
    { attrs: ["scheme"], elements: ["meta"] },
    { attrs: ["archive","classid","codebase","codetype","declare","standby"], elements: ["object"] },
    { attrs: ["valuetype","type"], elements: ["param"] },
    { attrs: ["axis","abbr"], elements: ["td","th"] },
    { attrs: ["scope"], elements: ["td"] },
    { attrs: ["summary"], elements: ["table"] },
    // presentational attributes
    { attrs: ["align"], elements: ["caption","iframe","img","input","object","legend","table","hr","div","h1","h2","h3","h4","h5","h6","p","col","colgroup","tbody","td","tfoot","th","thead","tr"] },
    { attrs: ["alink","link","text","vlink"], elements: ["body"] },
    { attrs: ["background"], elements: ["body"] },
    { attrs: ["bgcolor"], elements: ["table","tr","td","th","body"] },
    { attrs: ["border"], elements: ["object"] },
    { attrs: ["cellpadding","cellspacing"], elements: ["table"] },
    { attrs: ["char","charoff"], elements: ["col","colgroup","tbody","td","tfoot","th","thead","tr"] },
    { attrs: ["clear"], elements: ["br"] },
    { attrs: ["compact"], elements: ["dl","menu","ol","ul"] },
    { attrs: ["frame"], elements: ["table"] },
    { attrs: ["frameborder"], elements: ["iframe"] },
    { attrs: ["height"], elements: ["td","th"] },
    { attrs: ["hspace","vspace"], elements: ["img","object"] },
    { attrs: ["marginheight","marginwidth"], elements: ["iframe"] },
    { attrs: ["noshade"], elements: ["hr"] },
    { attrs: ["nowrap"], elements: ["td","th"] },
    { attrs: ["rules"], elements: ["table"] },
    { attrs: ["scrolling"], elements: ["iframe"] },
    { attrs: ["size"], elements: ["hr"] },
    { attrs: ["type"], elements: ["li","ul"] },
    { attrs: ["valign"], elements: ["col","colgroup","tbody","td","tfoot","th","thead","tr"] },
    { attrs: ["width"], elements: ["hr","table","td","th","col","colgroup","pre"] }
  ]

  listener.on("attribute", function(name) {
    var el = this
      , nodeName = el.nodeName.toLowerCase()
    obsoluteAttributesMap.forEach(function(item) {
      if (
        item.attrs.indexOf(name) > -1
        && item.elements.indexOf(nodeName) > -1
      ) {
        reporter.addError(
          "obsolete-attributes",
          "The '" + name + "' attribute of the '" + nodeName + "' element is obsolete and should not be used.",
          el
        )
      }
    })
  })

})

HTMLInspector.addRule("obsolete-elements", function(listener, reporter) {

  // http://www.w3.org/TR/html5-diff/#obsolete-elements
  var obsoluteElements = [
    "basefont",
    "big",
    "center",
    "font",
    "strike",
    "tt",
    "frame",
    "frameset",
    "noframes",
    "acronym",
    "applet",
    "isindex",
    "dir"
  ]

  listener.on("element", function(name) {
    if (obsoluteElements.indexOf(name) >= 0) {
      reporter.addError(
        "obsolete-elements",
        "The '" + name + "' element is obsolete and should not be used.",
        this
      )
    }
  })

})

HTMLInspector.addRule("required-attributes", function(listener, reporter) {

  // http://www.w3.org/TR/html4/index/attributes.html
  // http://www.w3.org/TR/html5-diff/#changed-attributes
  var elementMap = [
        { element: "area", attrs: ["alt"] },
        { element: "applet", attrs: ["height", "width"] },
        { element: "bdo", attrs: ["dir"] },
        { element: "form", attrs: ["action"] },
        { element: "img", attrs: ["alt", "src"] },
        { element: "map", attrs: ["name"] },
        { element: "optgroup", attrs: ["label"] },
        { element: "param", attrs: ["name"] },
        { element: "textarea", attrs: ["cols", "rows"] }
      ]

  listener.on("element", function(name) {

    var el = this

    elementMap.forEach(function(item) {

      var hasAllAttrs

      if (name === item.element) {
        hasAllAttrs = item.attrs.every(function(attr) {
          return $(el).attr(attr) != null
        })
        if (!hasAllAttrs) {
          reporter.addError(
            "required-attributes",
            "<" + name + "> elements must include the following attributes: '" + item.attrs.join("', '") + "'.",
            el
          )
        }
      }

    })
  })

})

HTMLInspector.addRule("unused-classes", function(listener, reporter) {

  var css = this.extensions.css
    , whitelist = css.whitelist
    , classes = css.getClassSelectors()

  listener.on('class', function(name) {
    if (!whitelist.test(name) && classes.indexOf(name) == -1) {
      reporter.addError(
        "unused-classes",
        "The class '"
        + name
        + "' is used in the HTML but not found in any stylesheet.",
        this
      )
    }
  })

})

// expose HTMLInspector globally
window.HTMLInspector = HTMLInspector

}(this, jQuery, document))