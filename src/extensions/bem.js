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