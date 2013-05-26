describe("on, off, and trigger", function() {

  afterEach(function() {
    HTMLInspector.removeEvents()
  })

  it("can add handlers to events that are invoked when those events are triggered", function() {
    var count = 0
      , fn = function() {
          count++
        }
    HTMLInspector.on("foo", fn)
    HTMLInspector.on("bar", fn)
    HTMLInspector.trigger("foo")
    HTMLInspector.trigger("bar")
    expect(count).toBe(2)
    HTMLInspector.trigger("foo")
    expect(count).toBe(3)
  })

  it("can remove an event handler", function() {
    var count = 0
      , fn = function() {
          count++
        }
    HTMLInspector.on("foo", fn)
    HTMLInspector.on("bar", fn)
    HTMLInspector.trigger("foo")
    HTMLInspector.trigger("bar")
    expect(count).toBe(2)
    HTMLInspector.trigger("foo")
    expect(count).toBe(3)
    HTMLInspector.off("foo", fn)
    HTMLInspector.off("bar", fn)
    HTMLInspector.trigger("foo")
    HTMLInspector.trigger("bar")
    expect(count).toBe(3)
  })

  it("triggers events with the HTMLInspector object as its context", function() {
    var context
    HTMLInspector.on("foo", function() {
      context = this
    })
    HTMLInspector.trigger("foo")
    expect(context).toBe(HTMLInspector)
  })

  it("can remove all bound events", function() {

  })

})




it("traverses the DOM emitting events as it goes", function() {

})

it("inspects the HTML starting from the domRoot options", function() {

})

it("can add an error to be reported when the inspection is complete", function() {
  var originalRules = HTMLInspector.rules
    , log = []
  HTMLInspector.addRule("error-test", function() {
    this.addError("error-test", "This is the message", document)
  })
  HTMLInspector.inspect({
    rules:["error-test"],
    complete: function(errors) {
      log = errors
    }
  })
  expect(log[0]).toEqual({
    rule: "error-test",
    message: "This is the message",
    context: document
  })
})


it("can add new rules", function() {
  var originalRules = HTMLInspector.rules
  HTMLInspector.addRule("new-rule", $.noop)
  expect(HTMLInspector.rules["new-rule"]).toBeDefined()
  delete HTMLInspector.rules["new-rule"]
})

it("can add new extensions", function() {
  var originalExtensions = HTMLInspector.extensions
  HTMLInspector.addExtension("new-extension", {})
  expect(HTMLInspector.extensions["new-extension"]).toBeDefined()
  delete HTMLInspector.extensions["new-extension"]
})