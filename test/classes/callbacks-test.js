var expect = require("chai").expect
  , assert = require("chai").assert
  , Callbacks = require("../../src/callbacks")

describe("Callbacks", function() {
  var cb
    , log
    , f1 = function(a, b, c) { log.push({id:"f1", args:[a, b, c], context:this }) }
    , f2 = function(a, b, c) { log.push({id:"f2", args:[a, b, c], context:this }) }
    , f3 = function(a, b, c) { log.push({id:"f3", args:[a, b, c], context:this }) }

  beforeEach(function() {
    cb = new Callbacks()
    log = []
  })

  describe("#add", function() {
    it("can add functions", function() {
      cb.add(f1)
      cb.add(f2)
      cb.add(f3)
      expect(cb.handlers.length).to.equal(3)
      expect(cb.handlers[0]).to.equal(f1)
      expect(cb.handlers[1]).to.equal(f2)
      expect(cb.handlers[2]).to.equal(f3)
    })
  })

  describe("#remove", function() {
    it("can remove functions", function() {
      cb.add(f1)
      cb.add(f2)
      cb.add(f3)
      cb.remove(f2)
      expect(cb.handlers.length).to.equal(2)
      expect(cb.handlers[0]).to.equal(f1)
      expect(cb.handlers[1]).to.equal(f3)
      cb.remove(f3)
      expect(cb.handlers.length).to.equal(1)
      expect(cb.handlers[0]).to.equal(f1)
      cb.remove(f1)
      expect(cb.handlers.length).to.equal(0)
    })
  })

  describe("#fire", function() {
    it("can invoke the list of callbacks", function() {
      var ctx1 = {}
        , ctx2 = {}
        , ctx3 = {}
      cb.fire()
      expect(log.length).to.equal(0)
      cb.add(f1)
      cb.fire(ctx1, ["arg1", "arg2"])
      expect(log.length).to.equal(1)
      expect(log[0]).to.deep.equal({id:"f1", args:["arg1", "arg2", undefined], context:ctx1})
      log = []
      cb.add(f2)
      cb.fire(ctx1, ["arg1", "arg2", "arg3"])
      expect(log.length).to.equal(2)
      expect(log[0]).to.deep.equal({id:"f1", args:["arg1", "arg2", "arg3"], context:ctx1})
      expect(log[1]).to.deep.equal({id:"f2", args:["arg1", "arg2", "arg3"], context:ctx1})
      log = []
      cb.add(f3)
      cb.fire(ctx2)
      expect(log.length).to.equal(3)
      expect(log[0]).to.deep.equal({id:"f1", args:[undefined, undefined, undefined], context:ctx2})
      expect(log[1]).to.deep.equal({id:"f2", args:[undefined, undefined, undefined], context:ctx2})
      expect(log[2]).to.deep.equal({id:"f3", args:[undefined, undefined, undefined], context:ctx2})
      log = []
      cb.remove(f2)
      cb.fire(ctx3, ["arg1"])
      expect(log.length).to.equal(2)
      expect(log[0]).to.deep.equal({id:"f1", args:["arg1", undefined, undefined], context:ctx3})
      expect(log[1]).to.deep.equal({id:"f3", args:["arg1", undefined, undefined], context:ctx3})
    })
  })
})
