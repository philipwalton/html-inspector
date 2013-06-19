describe("Listener", function() {

  var Listener = HTMLInspector._constructors.Listener

  it("can add handlers to a specific event", function() {
    var listener = new Listener()
    listener.on("foo", $.noop)
    listener.on("bar", $.noop)
    expect(listener._events.foo).toBeDefined()
    expect(listener._events.bar).toBeDefined()
  })

  it("can trigger handlers on a specific event", function() {
    var listener = new Listener()
    spyOn($, "noop")
    listener.on("foo", $.noop)
    listener.on("bar", $.noop)
    listener.trigger("foo")
    listener.trigger("bar")
    expect($.noop.callCount).toBe(2)
  })

  it("can remove handlers from a specific event", function() {
    var listener = new Listener()
    spyOn($, "noop")
    listener.on("foo", $.noop)
    listener.on("bar", $.noop)
    listener.off("foo", $.noop)
    listener.off("bar", $.noop)
    listener.trigger("foo")
    listener.trigger("bar")
    expect($.noop.callCount).toBe(0)
  })

})