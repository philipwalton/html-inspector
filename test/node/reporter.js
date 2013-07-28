var expect = require("chai").expect
  , Reporter = require("../../src/reporter")
  , ctx = {}

describe("Reporter", function() {

  describe("#warn", function() {
    it("can add an error to the report log", function() {
      var reporter = new Reporter()
      reporter.warn("rule-name", "This is the message", ctx)
      expect(reporter._errors.length).to.equal(1)
      expect(reporter._errors[0].rule).to.equal("rule-name")
      expect(reporter._errors[0].message).to.equal("This is the message")
      expect(reporter._errors[0].context).to.equal(ctx)
    })
  })

  describe("#getWarnings", function() {
    it("can get all the errors that have been logged", function() {
      var reporter = new Reporter()
      reporter.warn("rule-name", "This is the first message", ctx)
      reporter.warn("rule-name", "This is the second message", ctx)
      reporter.warn("rule-name", "This is the third message", ctx)
      expect(reporter.getWarnings().length).to.equal(3)
      expect(reporter.getWarnings()[0].message).to.equal("This is the first message")
      expect(reporter.getWarnings()[1].message).to.equal("This is the second message")
      expect(reporter.getWarnings()[2].message).to.equal("This is the third message")
    })
  })

})
