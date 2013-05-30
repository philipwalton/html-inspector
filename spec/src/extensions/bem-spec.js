describe("bem", function() {

  var bem = HTMLInspector.extensions.bem

  it("can take a BEM modifier or element class and returns its block's class name", function() {
    expect(bem.getBlockName("Block--modifier")).toBe("Block")
    expect(bem.getBlockName("BlockName--someModifier")).toBe("BlockName")
    expect(bem.getBlockName("Block-element")).toBe("Block")
    expect(bem.getBlockName("BlockName-subElement")).toBe("BlockName")
    expect(bem.getBlockName("BlockName")).toBe(false)
    expect(bem.getBlockName("Foo---bar")).toBe(false)
    expect(bem.getBlockName("Foo--bar--baz")).toBe(false)
  })

  it("can determine if a class is a block modifier class", function() {
    expect(bem.isBlockModifier("Block--modifier")).toBe(true)
    expect(bem.isBlockModifier("BlockName--modifierName")).toBe(true)
    expect(bem.isBlockModifier("Block-element")).toBe(false)
    expect(bem.isBlockModifier("BlockName-elementName")).toBe(false)
    expect(bem.isBlockModifier("Block--modifier-stuffz")).toBe(false)
    expect(bem.isBlockModifier("Block--modifier--stuffz")).toBe(false)
  })

  it("can determine if a class is a block element class", function() {
    expect(bem.isBlockElement("Block-element")).toBe(true)
    expect(bem.isBlockElement("BlockName-elementName")).toBe(true)
    expect(bem.isBlockElement("Block--modifier")).toBe(false)
    expect(bem.isBlockElement("BlockName--modifierName")).toBe(false)
    expect(bem.isBlockElement("Block--modifier-stuffz")).toBe(false)
    expect(bem.isBlockElement("Block--modifier--stuffz")).toBe(false)
  })

})