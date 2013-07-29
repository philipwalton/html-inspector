var expect = require("chai").expect
  , Modules = require("../../src/modules")

describe("Modules", function() {

  var modules

  beforeEach(function() {
    modules = new Modules()
  })

  describe("#add", function() {
    it("can add a new module", function() {
      modules.add({
        name: "new-module",
        module: {}
      })
      expect(modules["new-module"]).to.exist
    })
  })

  describe("#extend", function() {
    it("can extend an existing module with an options object", function() {
      modules.add({
        name: "new-module",
        module: {foo: "bar"}
      })
      modules.extend("new-module", {fizz: "buzz"})
      expect(modules["new-module"]).to.deep.equal({foo:"bar", fizz:"buzz"})
    })
    it("can extend an existing module with a function that returns an options object", function() {
      modules.add({
        name: "new-module",
        module: {list: [1]}
      })
      modules.extend("new-module", function() {
        this.list.push(2)
        this.foo = "bar"
        return this
      })
      expect(modules["new-module"]).to.deep.equal({list:[1, 2], foo:"bar"})
    })
  })
})
