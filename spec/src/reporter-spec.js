describe("Reporter", function() {

  var Reporter = getReporterConstructor()

  function getReporterConstructor() {
    var Reporter
      , originalRules = HTMLInspector.rules
    HTMLInspector.rules.add("reporter", function(reporter, reporter) {
      Reporter = reporter.constructor
    })
    HTMLInspector.inspect({
      useRules: ["reporter"],
      domRoot: document.createElement("div")
    })
    HTMLInspector.rules = originalRules
    return Reporter
  }

  it("can add an error to the report log", function() {
    var reporter = new Reporter()
    reporter.addError("rule-name", "This is the message", document)
    expect(reporter._errors.length).toBe(1)
    expect(reporter._errors[0].rule).toBe("rule-name")
    expect(reporter._errors[0].message).toBe("This is the message")
    expect(reporter._errors[0].context).toBe(document)
  })

  it("can get all the errors that have been logged", function() {
    var reporter = new Reporter()
    reporter.addError("rule-name", "This is the first message", document)
    reporter.addError("rule-name", "This is the second message", document)
    reporter.addError("rule-name", "This is the third message", document)
    expect(reporter.getErrors().length).toBe(3)
    expect(reporter.getErrors()[0].message).toBe("This is the first message")
    expect(reporter.getErrors()[1].message).toBe("This is the second message")
    expect(reporter.getErrors()[2].message).toBe("This is the third message")
  })

})