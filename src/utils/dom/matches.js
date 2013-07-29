var toArray = require("mout/lang/toArray")

/**
 * Detects the browser's native matches() implementation
 * and calls that. Error if not found.
 */
function matchesSelector(element, selector) {
  var i = 0
    , method
    , methods = [
        "matches",
        "matchesSelector",
        "webkitMatchesSelector",
        "mozMatchesSelector",
        "msMatchesSelector",
        "oMatchesSelector"
      ]
  while (method = methods[i++]) {
    if (typeof element[method] == "function")
      return element[method](selector)
  }
  throw new Error("You are using a browser that doesn't not support"
    + " element.matches() or element.matchesSelector()")
}

/**
 * Similar to jQuery's .is() method
 * Accepts a DOM element and an object to test against
 *
 * The test object can be a DOM element, a string selector, an array of
 * DOM elements or string selectors.
 *
 * Returns true if the element matches any part of the test
 */
function matches(element, test) {
  // test can be null, but if it is, it never matches
  if (test == null) {
    return false
  }
  // if test is a string or DOM element convert it to an array,
  else if (typeof test == "string" || test.nodeType) {
    test = [test]
  }
  // if it has a length property call toArray in case it's array-like
  else if ("length" in test) {
    test = toArray(test)
  }

  return test.some(function(item) {
    if (typeof item == "string")
      return matchesSelector(element, item)
    else
      return element === item
  })
}

module.exports = matches
