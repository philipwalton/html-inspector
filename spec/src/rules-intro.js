describe("Rules", function() {

  it("can add a new rule", function() {
    HTMLInspector.rules.add("new-rule", no.op)
    expect(HTMLInspector.rules["new-rule"]).toBeDefined()
    ;delete HTMLInspector.rules["new-rule"]
  })

  it("can extend an existing rule with an options object", function() {
    var config = {foo: "bar"}
    HTMLInspector.rules.add("new-rule", config, no.op)
    HTMLInspector.rules.extend("new-rule", {fizz: "buzz"})
    expect(HTMLInspector.rules["new-rule"].config).toEqual({foo:"bar", fizz:"buzz"})
    ;delete HTMLInspector.rules["new-rule"]
  })

  it("can extend an existing rule with a function that returns an options object", function() {
    var config = {list: [1]}
    HTMLInspector.rules.add("new-rule", config, no.op)
    HTMLInspector.rules.extend("new-rule", function(config) {
      config.list.push(2)
      return config
    })
    expect(HTMLInspector.rules["new-rule"].config).toEqual({list:[1, 2]})
    HTMLInspector.rules.extend("new-rule", function(config) {
      this.foo = "bar"
      return this
    })
    expect(HTMLInspector.rules["new-rule"].config).toEqual({list:[1, 2], foo:"bar"})
    ;delete HTMLInspector.rules["new-rule"]
  })