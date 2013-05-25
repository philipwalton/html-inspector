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