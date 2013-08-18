var expect = require("chai").expect
  , foundIn = require("../../src/utils/string-matcher")

describe("foundIn", function() {
  it("matches a string against a string, RegExp, or list of strings/RegeExps", function() {
    expect(foundIn("foo", "foo")).to.equal(true)
    expect(foundIn("foo", /^fo\w/)).to.equal(true)
    expect(foundIn("foo", [/\d+/, /^fo\w/])).to.equal(true)
    expect(foundIn("foo", ["fo", "f", /foo/])).to.equal(true)
    expect(foundIn("bar", "foo")).to.equal(false)
    expect(foundIn("bar", /^fo\w/)).to.equal(false)
    expect(foundIn("bar", [/\d+/, /^fo\w/])).to.equal(false)
    expect(foundIn("bar", ["fo", "f", /foo/])).to.equal(false)
  })
})
