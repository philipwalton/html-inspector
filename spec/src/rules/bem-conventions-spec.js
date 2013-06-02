describe("bem-conventions", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  describe("config", function() {

    var config = HTMLInspector.rules["bem-conventions"].config

    it("can take a BEM modifier or element class and returns its block's class name", function() {
      expect(config.getBlockName("Block--modifier")).toBe("Block")
      expect(config.getBlockName("BlockName--someModifier")).toBe("BlockName")
      expect(config.getBlockName("Block-element")).toBe("Block")
      expect(config.getBlockName("BlockName-subElement")).toBe("BlockName")
      expect(config.getBlockName("BlockName-subElement--modifierName")).toBe("BlockName-subElement")
      expect(config.getBlockName("BlockName")).toBe(false)
      expect(config.getBlockName("Foo---bar")).toBe(false)
      expect(config.getBlockName("Foo--bar--baz")).toBe(false)
      // the second convention
      expect(config.getBlockName("block--modifier")).toBe("block")
      expect(config.getBlockName("block-name--some-modifier")).toBe("block-name")
      expect(config.getBlockName("block__element")).toBe("block")
      expect(config.getBlockName("block-name__sub-element")).toBe("block-name")
      expect(config.getBlockName("block-name__sub-element--modifier-name")).toBe("block-name__sub-element")
      expect(config.getBlockName("block-name")).toBe(false)
      expect(config.getBlockName("foo---bar")).toBe(false)
      expect(config.getBlockName("foo--bar__baz")).toBe(false)
      // the third convention
      expect(config.getBlockName("block_modifier")).toBe("block")
      expect(config.getBlockName("block-name_some_modifier")).toBe("block-name")
      expect(config.getBlockName("block__element")).toBe("block")
      expect(config.getBlockName("block-name__sub-element")).toBe("block-name")
      expect(config.getBlockName("block-name__sub-element_modifier_name")).toBe("block-name__sub-element")
      expect(config.getBlockName("block-name")).toBe(false)
      expect(config.getBlockName("foo___bar")).toBe(false)
      expect(config.getBlockName("foo_bar__baz")).toBe(false)
    })

    it("can determine if a class is a block element class", function() {
      expect(config.isElement("Block-element")).toBe(true)
      expect(config.isElement("BlockName-elementName")).toBe(true)
      expect(config.isElement("Block--modifier")).toBe(false)
      expect(config.isElement("BlockName--modifierName")).toBe(false)
      expect(config.isElement("Block--modifier-stuffz")).toBe(false)
      expect(config.isElement("Block--modifier--stuffz")).toBe(false)
      // the second convention
      expect(config.isElement("block__element")).toBe(true)
      expect(config.isElement("block-name__element-name")).toBe(true)
      expect(config.isElement("block--modifier")).toBe(false)
      expect(config.isElement("block-name--modifier-name")).toBe(false)
      expect(config.isElement("block__element__sub-element")).toBe(false)
      expect(config.isElement("block--modifier--stuffz")).toBe(false)
      // the third convention
      expect(config.isElement("block__element")).toBe(true)
      expect(config.isElement("block-name__element-name")).toBe(true)
      expect(config.isElement("block_modifier")).toBe(false)
      expect(config.isElement("block-name_modifier_name")).toBe(false)
      expect(config.isElement("block__element__sub-element")).toBe(false)
      expect(config.isElement("block_modifier_stuffz")).toBe(false)
    })

    it("can determine if a class is a block modifier class", function() {
      expect(config.isModifier("Block--modifier")).toBe(true)
      expect(config.isModifier("BlockName--modifierName")).toBe(true)
      expect(config.isModifier("BlockName-elementName--modifierName")).toBe(true)
      expect(config.isModifier("Block-element")).toBe(false)
      expect(config.isModifier("BlockName-elementName")).toBe(false)
      expect(config.isModifier("Block--modifier-stuffz")).toBe(false)
      expect(config.isModifier("Block--modifier--stuffz")).toBe(false)
      // the second convention
      expect(config.isModifier("block--modifier")).toBe(true)
      expect(config.isModifier("block-name--modifier-name")).toBe(true)
      expect(config.isModifier("block-name__element-name--modifier-name")).toBe(true)
      expect(config.isModifier("block__element")).toBe(false)
      expect(config.isModifier("block-name__element-name")).toBe(false)
      expect(config.isModifier("block--modifierStuffz")).toBe(false)
      // the third convention
      expect(config.isModifier("block_modifier")).toBe(true)
      expect(config.isModifier("block-name_modifier_name")).toBe(true)
      expect(config.isModifier("block-name__element-name_modifier_name")).toBe(true)
      expect(config.isModifier("block__element")).toBe(false)
      expect(config.isModifier("block-name__element-name")).toBe(false)
      expect(config.isModifier("block_modifierStuffz")).toBe(false)
    })

  })

  it("warns when a BEM element class is used when not the descendent of a block", function() {
    var $html = $(''
          + '<div class="BlockOne SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-elementName">three</em></p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      rules: ["bem-conventions"],
      domRoot: $html,
      complete: complete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM element 'BlockTwo-element' must be a descendent of 'BlockTwo'.")
    expect(log[1].message).toBe("The BEM element 'BlockThree-elementName' must be a descendent of 'BlockThree'.")
    expect(log[0].context).toBe($html.find(".BlockTwo-element")[0])
    expect(log[1].context).toBe($html.find(".BlockThree-elementName")[0])
  })

  it("doesn't warn when a BEM element class is used as the descendent of a block", function() {
    var $html = $(''
          + '<div class="BlockThree BlockTwo SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-elementName">three</em></p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      rules: ["bem-conventions"],
      domRoot: $html,
      complete: complete
    })
    expect(log.length).toBe(0)
  })

  it("warns when a BEM modifier class is used without the unmodified block or element class", function() {
    var $html = $(''
          + '<div class="BlockOne--active">'
          + '  <p class="BlockTwo--validName BlockThree SomeOtherBlock">Foo</p>'
          + '  <p class="Block-element--modified">Bar</p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      rules: ["bem-conventions"],
      domRoot: $html,
      complete: complete
    })
    expect(log.length).toBe(3)
    expect(log[0].message).toBe("The BEM modifier class 'BlockOne--active' was found without the unmodified class 'BlockOne'.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].message).toBe("The BEM modifier class 'BlockTwo--validName' was found without the unmodified class 'BlockTwo'.")
    expect(log[1].context).toBe($html.find(".BlockTwo--validName")[0])
    expect(log[2].message).toBe("The BEM modifier class 'Block-element--modified' was found without the unmodified class 'Block-element'.")
    expect(log[2].context).toBe($html.find(".Block-element--modified")[0])
  })

  it("doesn't warn when a BEM modifier is used along with the unmodified block or element class", function() {
    var $html = $(''
          + '<div class="BlockOne BlockOne--active">'
          + '  <p class="BlockTwo BlockTwo--validName SomeOtherBlock">Foo</p>'
          + '  <p>Bar</p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      rules: ["bem-conventions"],
      domRoot: $html,
      complete: complete
    })
    expect(log.length).toBe(0)
  })

  it("allows for customization by altering the config object", function() {
    var $html = $(''
          + '<div class="block-one">'
          + '  <p class="block-two---valid-name">Foo</p>'
          + '  <p class="block-three___element-name">Bar</p>'
          + '</div>'
        )
    HTMLInspector.rules["bem-conventions"].config.methods.push({
      modifier: /^((?:[a-z]+\-)*[a-z]+(?:___(?:[a-z]+\-)*[a-z]+)?)\-\-\-(?:[a-z]+\-)*[a-z]+$/,
      element: /^((?:[a-z]+\-)*[a-z]+)___(?:[a-z]+\-)*[a-z]+$/
    })
    HTMLInspector.inspect({
      rules: ["bem-conventions"],
      domRoot: $html,
      complete: complete
    })
    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The BEM modifier class 'block-two---valid-name' was found without the unmodified class 'block-two'.")
    expect(log[1].message).toBe("The BEM element 'block-three___element-name' must be a descendent of 'block-three'.")
  })

})