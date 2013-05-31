HTMLInspector.addExtension("attributes", (function() {

  return {

    /* ============================================================
     * Attributes that are required to be on particular elements
     *
     * http://www.w3.org/TR/html4/index/attributes.html
     * http://www.w3.org/TR/html5-diff/#changed-attributes
     * ============================================================
     */
    requiredAttributes: [
      { attrs: ["alt"], element: "area" },
      { attrs: ["height", "width"], element: "applet" },
      { attrs: ["dir"], element: "bdo" },
      { attrs: ["action"], element: "form" },
      { attrs: ["alt", "src"], element: "img" },
      { attrs: ["name"], element: "map" },
      { attrs: ["label"], element: "optgroup" },
      { attrs: ["name"], element: "param" },
      { attrs: ["cols", "rows"], element: "textarea" }
    ],

    /* =============================================================
     * Attributes that may no longer appear on these particular
     * elements. They are obsolete.
     *
     * http://www.w3.org/TR/html5-diff/#obsolete-attributes
     * =============================================================
     */
    obsoluteAttributes: [
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
    ],

    /* =============================================================
     * A list of which attributes are allow on which elements
     *
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
     *
     * TODO: this list is most likely incomplete
     * I've commented out some of the things I know are incorrect
     * =============================================================
     */
    allowedAttributes: [
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
    ],

    /* =============================================================
     * Attributes that may be found on any element
     *
     * http://dev.w3.org/html5/spec-preview/global-attributes.html
     * http://www.w3.org/TR/html5-diff/#new-attributes
     * =============================================================
     */
    globalAttributes: [
      "accesskey",
      "aria-*",
      "class",
      "contenteditable",
      "contextmenu",
      "data-*",
      "dir",
      "draggable",
      "dropzone",
      "hidden",
      "id",
      "lang",
      "role",
      "spellcheck",
      "style",
      "tabindex",
      "title",
      "translate"
    ],

    /* =============================================================
     * A pattern to whitelist custom attributes
     *
     * This RegExp ignores angularJS's ng-* attributes
     * =============================================================
     */
    attributeWhitelist: /^ng-[a-z\-]+$/

  }

}()))