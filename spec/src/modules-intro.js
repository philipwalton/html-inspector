describe("Modules", function() {

  it("can add a new module", function() {
    HTMLInspector.modules.add("new-module", {})
    expect(HTMLInspector.modules["new-module"]).toBeDefined()
    ;delete HTMLInspector.modules["new-module"]
  })

  it("can extend an existing module with an options object", function() {
    HTMLInspector.modules.add("new-module", {foo: "bar"})
    HTMLInspector.modules.extend("new-module", {fizz: "buzz"})
    expect(HTMLInspector.modules["new-module"]).toEqual({foo:"bar", fizz:"buzz"})
    ;delete HTMLInspector.modules["new-module"]
  })

  it("can extend an existing module with a function that returns an options object", function() {
    HTMLInspector.modules.add("new-module", {list: [1]})
    HTMLInspector.modules.extend("new-module", function() {
      this.list.push(2)
      this.foo = "bar"
      return this
    })
    expect(HTMLInspector.modules["new-module"]).toEqual({list:[1, 2], foo:"bar"})
    ;delete HTMLInspector.modules["new-module"]
  })