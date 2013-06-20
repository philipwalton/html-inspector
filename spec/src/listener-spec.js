describe("Listener", function() {

  var Listener = HTMLInspector._constructors.Listener

  it("can add handlers to a specific event", function() {
    var listener = new Listener()
    listener.on("foo", no.op)
    listener.on("bar", no.op)
    expect(listener._events.foo).toBeDefined()
    expect(listener._events.bar).toBeDefined()
  })

  it("can trigger handlers on a specific event", function() {
    var listener = new Listener()
    spyOn(no, "op")
    listener.on("foo", no.op)
    listener.on("bar", no.op)
    listener.trigger("foo")
    listener.trigger("bar")
    expect(no.op.callCount).toBe(2)
  })

  it("can remove handlers from a specific event", function() {
    var listener = new Listener()
    spyOn(no, "op")
    listener.on("foo", no.op)
    listener.on("bar", no.op)
    listener.off("foo", no.op)
    listener.off("bar", no.op)
    listener.trigger("foo")
    listener.trigger("bar")
    expect(no.op.callCount).toBe(0)
  })

})