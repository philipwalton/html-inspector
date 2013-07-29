describe("bem-conventions", function() {

  var log
    , originalConfig = HTMLInspector.rules["bem-conventions"].config

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  afterEach(function() {
    HTMLInspector.rules["bem-conventions"].config.methodology = "suit"
  })

  describe("config", function() {

    var config = HTMLInspector.rules["bem-conventions"].config

    it("can take a BEM modifier or element class and returns its block's class name", function() {
      expect(config.getBlockName("Block--modifier")).to.equal("Block")
      expect(config.getBlockName("BlockName--someModifier")).to.equal("BlockName")
      expect(config.getBlockName("Block-element")).to.equal("Block")
      expect(config.getBlockName("BlockName-subElement")).to.equal("BlockName")
      expect(config.getBlockName("BlockName-subElement--modifierName")).to.equal("BlockName-subElement")
      expect(config.getBlockName("BlockName")).to.equal(false)
      expect(config.getBlockName("Foo---bar")).to.equal(false)
      expect(config.getBlockName("Foo--bar--baz")).to.equal(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.getBlockName("block--modifier")).to.equal("block")
      expect(config.getBlockName("block-name--some-modifier")).to.equal("block-name")
      expect(config.getBlockName("block__element")).to.equal("block")
      expect(config.getBlockName("block-name__sub-element")).to.equal("block-name")
      expect(config.getBlockName("block-name__sub-element--modifier-name")).to.equal("block-name__sub-element")
      expect(config.getBlockName("block-name")).to.equal(false)
      expect(config.getBlockName("foo---bar")).to.equal(false)
      expect(config.getBlockName("foo--bar__baz")).to.equal(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.getBlockName("block_modifier")).to.equal("block")
      expect(config.getBlockName("block-name_some_modifier")).to.equal("block-name")
      expect(config.getBlockName("block__element")).to.equal("block")
      expect(config.getBlockName("block-name__sub-element")).to.equal("block-name")
      expect(config.getBlockName("block-name__sub-element_modifier_name")).to.equal("block-name__sub-element")
      expect(config.getBlockName("block-name")).to.equal(false)
      expect(config.getBlockName("foo___bar")).to.equal(false)
      expect(config.getBlockName("foo_bar__baz")).to.equal(false)
    })

    it("can determine if a class is a block element class", function() {
      expect(config.isElement("Block-element")).to.equal(true)
      expect(config.isElement("BlockName-elementName")).to.equal(true)
      expect(config.isElement("Block--modifier")).to.equal(false)
      expect(config.isElement("BlockName--modifierName")).to.equal(false)
      expect(config.isElement("Block--modifier-stuffz")).to.equal(false)
      expect(config.isElement("Block--modifier--stuffz")).to.equal(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.isElement("block__element")).to.equal(true)
      expect(config.isElement("block-name__element-name")).to.equal(true)
      expect(config.isElement("block--modifier")).to.equal(false)
      expect(config.isElement("block-name--modifier-name")).to.equal(false)
      expect(config.isElement("block__element__sub-element")).to.equal(false)
      expect(config.isElement("block--modifier--stuffz")).to.equal(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.isElement("block__element")).to.equal(true)
      expect(config.isElement("block-name__element-name")).to.equal(true)
      expect(config.isElement("block_modifier")).to.equal(false)
      expect(config.isElement("block-name_modifier_name")).to.equal(false)
      expect(config.isElement("block__element__sub-element")).to.equal(false)
      expect(config.isElement("block_modifier_stuffz")).to.equal(false)
    })

    it("can determine if a class is a block modifier class", function() {
      expect(config.isModifier("Block--modifier")).to.equal(true)
      expect(config.isModifier("BlockName--modifierName")).to.equal(true)
      expect(config.isModifier("BlockName-elementName--modifierName")).to.equal(true)
      expect(config.isModifier("Block-element")).to.equal(false)
      expect(config.isModifier("BlockName-elementName")).to.equal(false)
      expect(config.isModifier("Block--modifier-stuffz")).to.equal(false)
      expect(config.isModifier("Block--modifier--stuffz")).to.equal(false)
      // the second convention
      config.methodology = "inuit"
      expect(config.isModifier("block--modifier")).to.equal(true)
      expect(config.isModifier("block-name--modifier-name")).to.equal(true)
      expect(config.isModifier("block-name__element-name--modifier-name")).to.equal(true)
      expect(config.isModifier("block__element")).to.equal(false)
      expect(config.isModifier("block-name__element-name")).to.equal(false)
      expect(config.isModifier("block--modifierStuffz")).to.equal(false)
      // the third convention
      config.methodology = "yandex"
      expect(config.isModifier("block_modifier")).to.equal(true)
      expect(config.isModifier("block-name_modifier_name")).to.equal(true)
      expect(config.isModifier("block-name__element-name_modifier_name")).to.equal(true)
      expect(config.isModifier("block__element")).to.equal(false)
      expect(config.isModifier("block-name__element-name")).to.equal(false)
      expect(config.isModifier("block_modifierStuffz")).to.equal(false)
    })

  })

  it("warns when a BEM element class is used when not the descendent of a block", function() {
    var html = parseHTML(''
          + '<div class="BlockOne SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-elementName">three</em></p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The BEM element 'BlockTwo-element' must be a descendent of 'BlockTwo'.")
    expect(log[1].message).to.equal("The BEM element 'BlockThree-elementName' must be a descendent of 'BlockThree'.")
    expect(log[0].context).to.equal(html.querySelector(".BlockTwo-element"))
    expect(log[1].context).to.equal(html.querySelector(".BlockThree-elementName"))
  })

  it("doesn't warn when a BEM element class is used as the descendent of a block", function() {
    var html = parseHTML(''
          + '<div class="BlockThree BlockTwo SomeOtherBlock">'
          + '  <p class="BlockTwo-element">Foo</p>'
          + '  <p>Bar <em class="BlockThree-elementName">three</em></p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(0)
  })

  it("warns when a BEM modifier class is used without the unmodified block or element class", function() {
    var html = parseHTML(''
          + '<div class="BlockOne--active">'
          + '  <p class="BlockTwo--validName BlockThree SomeOtherBlock">Foo</p>'
          + '  <p class="Block-element--modified">Bar</p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(3)
    expect(log[0].message).to.equal("The BEM modifier class 'BlockOne--active' was found without the unmodified class 'BlockOne'.")
    expect(log[0].context).to.equal(html)
    expect(log[1].message).to.equal("The BEM modifier class 'BlockTwo--validName' was found without the unmodified class 'BlockTwo'.")
    expect(log[1].context).to.equal(html.querySelector(".BlockTwo--validName"))
    expect(log[2].message).to.equal("The BEM modifier class 'Block-element--modified' was found without the unmodified class 'Block-element'.")
    expect(log[2].context).to.equal(html.querySelector(".Block-element--modified"))
  })

  it("doesn't warn when a BEM modifier is used along with the unmodified block or element class", function() {
    var html = parseHTML(''
          + '<div class="BlockOne BlockOne--active">'
          + '  <p class="BlockTwo BlockTwo--validName SomeOtherBlock">Foo</p>'
          + '  <p>Bar</p>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(0)
  })

  it("allows for customization by altering the config object", function() {
    var html = parseHTML(''
          + '<div class="block-one">'
          + '  <p class="block-two---valid-name">Foo</p>'
          + '  <p class="block-three___element-name">Bar</p>'
          + '</div>'
        )
    HTMLInspector.rules.extend("bem-conventions", {
      methodology: {
        modifier: /^((?:[a-z]+\-)*[a-z]+(?:___(?:[a-z]+\-)*[a-z]+)?)\-\-\-(?:[a-z]+\-)*[a-z]+$/,
        element: /^((?:[a-z]+\-)*[a-z]+)___(?:[a-z]+\-)*[a-z]+$/
      }
    })
    HTMLInspector.inspect({
      useRules: ["bem-conventions"],
      domRoot: html,
      onComplete: onComplete
    })
    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("The BEM modifier class 'block-two---valid-name' was found without the unmodified class 'block-two'.")
    expect(log[1].message).to.equal("The BEM element 'block-three___element-name' must be a descendent of 'block-three'.")
  })

})