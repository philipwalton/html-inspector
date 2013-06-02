;(function() {

  // ============================================================
  // There are several different BEM naming conventions that
  // I'm aware of. The `methods` property supports these three:
  //
  //  1) block-name
  //     block-name--modifier-name
  //     block-name__element-name
  //     block-name__element-name--modifier-name
  //
  //  2) BlockName
  //     BlockName--modifierName
  //     BlockName-elementName
  //     BlockName-elementName--modifierName
  //
  //  3) block-name
  //     block-name__elemement-name
  //     block-name_modifier_name
  //     block-name__element-name_modifier_name
  //
  // ============================================================

  var config = {
    methods: [
      {
        modifier: /^([A-Z][a-zA-Z]*(?:\-[a-zA-Z]+)?)\-\-[a-zA-Z]+$/,
        element: /^([A-Z][a-zA-Z]*)\-[a-zA-Z]+$/
      },
      {
        modifier: /^((?:[a-z]+\-)*[a-z]+(?:__(?:[a-z]+\-)*[a-z]+)?)\-\-(?:[a-z]+\-)*[a-z]+$/,
        element: /^((?:[a-z]+\-)*[a-z]+)__(?:[a-z]+\-)*[a-z]+$/
      },
      {
        modifier: /^((?:[a-z]+\-)*[a-z]+(?:__(?:[a-z]+\-)*[a-z]+)?)_(?:[a-z]+_)*[a-z]+$/,
        element: /^((?:[a-z]+\-)*[a-z]+)__(?:[a-z]+\-)*[a-z]+$/
      }
    ],
    getBlockName: function(elementOrModifier) {
      var block
      config.methods.forEach(function(method) {
        if (method.modifier.test(elementOrModifier))
          return block = RegExp.$1
        if (method.element.test(elementOrModifier))
          return block = RegExp.$1
      })
      return block || false
    },
    isElement: function(cls) {
      return config.methods.some(function(method) {
        return method.element.test(cls)
      })
    },
    isModifier: function(cls) {
      return config.methods.some(function(method) {
        return method.modifier.test(cls)
      })
    }
  }

  HTMLInspector.addRule(
    "bem-conventions",
    config,
    function(listener, reporter, config) {
      listener.on('class', function(name) {
        if (config.isElement(name)) {
          // check the ancestors for the block class
          if (!$(this).parents().is("." + config.getBlockName(name))) {
            reporter.addError(
              "bem-conventions",
              "The BEM element '" + name
              + "' must be a descendent of '" + config.getBlockName(name)
              + "'.",
              this
            )
          }
        }
        if (config.isModifier(name)) {
          if (!$(this).is("." + config.getBlockName(name))) {
            reporter.addError(
              "bem-conventions",
              "The BEM modifier class '" + name
              + "' was found without the unmodified class '" + config.getBlockName(name)
              +  "'.",
              this
            )
          }
        }
      }
    )
  })
}())