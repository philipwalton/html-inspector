describe("Callbacks", function() {

  var Callbacks = HTMLInspector._constructors.Callbacks
    , cb
    , log
    , f1 = function(a, b, c) { log.push({id:"f1", args:[a, b, c], context:this}) }
    , f2 = function(a, b, c) { log.push({id:"f2", args:[a, b, c], context:this}) }
    , f3 = function(a, b, c) { log.push({id:"f3", args:[a, b, c], context:this}) }

  beforeEach(function() {
    cb = new Callbacks()
    log = []
  })

  it("can add functions", function() {
    cb.add(f1)
    cb.add(f2)
    cb.add(f3)
    expect(cb.handlers.length).toBe(3)
    expect(cb.handlers[0]).toBe(f1)
    expect(cb.handlers[1]).toBe(f2)
    expect(cb.handlers[2]).toBe(f3)
  })

  it("can remove functions", function() {
    cb.add(f1)
    cb.add(f2)
    cb.add(f3)
    cb.remove(f2)
    expect(cb.handlers.length).toBe(2)
    expect(cb.handlers[0]).toBe(f1)
    expect(cb.handlers[1]).toBe(f3)
    cb.remove(f3)
    expect(cb.handlers.length).toBe(1)
    expect(cb.handlers[0]).toBe(f1)
    cb.remove(f1)
    expect(cb.handlers.length).toBe(0)
  })

  it("call invoke the list of callbacks", function() {
    cb.fire()
    expect(log.length).toBe(0)
    cb.add(f1)
    cb.fire("ctx1", ["arg1", "arg2"])
    expect(log.length).toBe(1)
    expect(log[0]).toEqual({id:"f1", args:["arg1", "arg2", undefined], context:"ctx1"})
    log = []
    cb.add(f2)
    cb.fire("ctx1", ["arg1", "arg2", "arg3"])
    expect(log.length).toBe(2)
    expect(log[0]).toEqual({id:"f1", args:["arg1", "arg2", "arg3"], context:"ctx1"})
    expect(log[1]).toEqual({id:"f2", args:["arg1", "arg2", "arg3"], context:"ctx1"})
    log = []
    cb.add(f3)
    cb.fire("ctx2")
    expect(log.length).toBe(3)
    expect(log[0]).toEqual({id:"f1", args:[undefined, undefined, undefined], context:"ctx2"})
    expect(log[1]).toEqual({id:"f2", args:[undefined, undefined, undefined], context:"ctx2"})
    expect(log[2]).toEqual({id:"f3", args:[undefined, undefined, undefined], context:"ctx2"})
    log = []
    cb.remove(f2)
    cb.fire("ctx3", ["arg1"])
    expect(log.length).toBe(2)
    expect(log[0]).toEqual({id:"f1", args:["arg1", undefined, undefined], context:"ctx3"})
    expect(log[1]).toEqual({id:"f3", args:["arg1", undefined, undefined], context:"ctx3"})
  })

})