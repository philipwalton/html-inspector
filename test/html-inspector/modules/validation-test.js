describe("validation", function() {

  var validation = HTMLInspector.modules.validation
    , originalElementWhitelist = validation.elementWhitelist
    , originalAttributeWhitelist = validation.attributeWhitelist

  afterEach(function() {
    validation.elementWhitelist = originalElementWhitelist
    validation.attributeWhitelist = originalAttributeWhitelist
  })

  it("can determine if an element is a valid HTML element", function() {
    expect(validation.isElementValid("p")).to.equal(true)
    expect(validation.isElementValid("time")).to.equal(true)
    expect(validation.isElementValid("bogus")).to.equal(false)
    expect(validation.isElementValid("hgroup")).to.equal(false)
  })

  it("can determine if an element is obsolete", function() {
    expect(validation.isElementObsolete("p")).to.equal(false)
    expect(validation.isElementObsolete("bogus")).to.equal(false)
    expect(validation.isElementObsolete("hgroup")).to.equal(true)
    expect(validation.isElementObsolete("blink")).to.equal(true)
    expect(validation.isElementObsolete("center")).to.equal(true)
  })

  it("can determine if an attribute is allowed on an element", function() {
    expect(validation.isAttributeValidForElement("href", "a")).to.equal(true)
    expect(validation.isAttributeValidForElement("aria-foobar", "nav")).to.equal(true)
    expect(validation.isAttributeValidForElement("data-stuff", "section")).to.equal(true)
    expect(validation.isAttributeValidForElement("href", "button")).to.equal(false)
    expect(validation.isAttributeValidForElement("placeholder", "select")).to.equal(false)
  })

  it("can determine if an attribute is obsolute for an element", function() {
    expect(validation.isAttributeObsoleteForElement("align", "div")).to.equal(true)
    expect(validation.isAttributeObsoleteForElement("bgcolor", "body")).to.equal(true)
    expect(validation.isAttributeObsoleteForElement("border", "img")).to.equal(true)
    expect(validation.isAttributeObsoleteForElement("href", "div")).to.equal(false)
    expect(validation.isAttributeObsoleteForElement("charset", "meta")).to.equal(false)
  })

  it("can determine if an attribute is required for an element", function() {
    expect(validation.isAttributeRequiredForElement("src", "img")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("alt", "img")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("action", "form")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("rows", "textarea")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("cols", "textarea")).to.equal(true)
    expect(validation.isAttributeRequiredForElement("id", "div")).to.equal(false)
    expect(validation.isAttributeRequiredForElement("target", "a")).to.equal(false)
  })

  it("can get a list of required attribute given an element", function() {
    expect(validation.getRequiredAttributesForElement("img")).to.deep.equal(["alt", "src"])
    expect(validation.getRequiredAttributesForElement("optgroup")).to.deep.equal(["label"])
    expect(validation.getRequiredAttributesForElement("form")).to.deep.equal(["action"])
    expect(validation.getRequiredAttributesForElement("div")).to.deep.equal([])
  })

  it("can determine if a child elememnt is allowed inside it's parent", function() {
    expect(validation.isChildAllowedInParent("div", "ul")).to.equal(false)
    expect(validation.isChildAllowedInParent("div", "span")).to.equal(false)
    expect(validation.isChildAllowedInParent("section", "em")).to.equal(false)
    expect(validation.isChildAllowedInParent("title", "body")).to.equal(false)
    expect(validation.isChildAllowedInParent("strong", "p")).to.equal(true)
    expect(validation.isChildAllowedInParent("li", "ol")).to.equal(true)
    expect(validation.isChildAllowedInParent("fieldset", "form")).to.equal(true)
    expect(validation.isChildAllowedInParent("td", "tr")).to.equal(true)
  })

  it("ignores elements that are whitelisted", function() {
    validation.elementWhitelist = validation.elementWhitelist.concat(["foo", "bar", "font", "center"])
    // valid elements
    expect(validation.isElementValid("foo")).to.equal(true)
    expect(validation.isElementValid("bar")).to.equal(true)
    // obsolete elements
    expect(validation.isElementObsolete("font")).to.equal(false)
    expect(validation.isElementObsolete("center")).to.equal(false)
  })

})
