describe("Reporter", function() {

  var Reporter = HTMLInspector._constructors.Reporter

  it("can add an error to the report log", function() {
    var reporter = new Reporter()
    reporter.warn("rule-name", "This is the message", document)
    expect(reporter._errors.length).toBe(1)
    expect(reporter._errors[0].rule).toBe("rule-name")
    expect(reporter._errors[0].message).toBe("This is the message")
    expect(reporter._errors[0].context).toBe(document)
  })

  it("can get all the errors that have been logged", function() {
    var reporter = new Reporter()
    reporter.warn("rule-name", "This is the first message", document)
    reporter.warn("rule-name", "This is the second message", document)
    reporter.warn("rule-name", "This is the third message", document)
    expect(reporter.getWarnings().length).toBe(3)
    expect(reporter.getWarnings()[0].message).toBe("This is the first message")
    expect(reporter.getWarnings()[1].message).toBe("This is the second message")
    expect(reporter.getWarnings()[2].message).toBe("This is the third message")
  })

})