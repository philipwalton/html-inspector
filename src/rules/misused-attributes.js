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