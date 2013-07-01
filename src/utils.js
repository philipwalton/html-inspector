var slice = Array.prototype.slice

/**
 * Convert an array like object to an array
 */
function toArray(arrayLike) {
  return arrayLike && (arrayLike.length)
    ? slice.call(arrayLike)
    : []
}

/**
 * Get a sorted array of the elements attributes
 */
function getAttributes(element) {
  var map = element.attributes
    , len = map.length
    , i = 0
    , attr
    , attrs = []

  // return an empty array if there are no attributes
  if (len === 0) return []

  while (attr = map[i++]) {
    attrs.push({name: attr.name, value: attr.value})
  }
  return attrs.sort(function(a, b) {
    if (a.name === b.name) return 0
    return a.name < b.name ? -1 : 1
  })
}

/**
 * Determine if an object is a Regular Expression
 */
function isRegExp(obj) {
  return Object.prototype.toString.call(obj) == "[object RegExp]"
}


/**
 * Consume an array and return a new array with no duplicate values
 */
function unique(array) {
  var uniq = []
  array = array.sort()
  array.forEach(function(val, i) {
    val !== array[i-1] && uniq.push(val)
  })
  return uniq
}

/**
 * Extend a given object with all the properties in passed-in object(s).
 */
function extend(obj) {
  slice.call(arguments, 1).forEach(function(source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}

/**
 * Given a string and a RegExp or a list of strings or RegExps,
 * does the string match any of the items in the list?
 */
function foundIn(needle, haystack) {
  // if haystack is a RegExp and not an array, just compare againt it
  if (isRegExp(haystack)) return haystack.test(needle)

  // if haystack is a String, just compare against it
  if (typeof haystack == "string") return needle == haystack

  // otherwise check each item in the list
  return haystack.some(function(item) {
    return isRegExp(item) ? item.test(needle) : needle === item
  })
}

/**
 * Tests whether a fully-qualified URL is cross-origin
 * Same origin URLs must have the same protocol and host
 * (note: host include hostname and port)
 */
function isCrossOrigin(url) {
  var reURL = /^(?:(https?:)\/\/)?((?:[0-9a-z\.\-]+)(?::(?:\d+))?)/
    , matches = reURL.exec(url)
    , protocol = matches[1]
    , host = matches[2]
  return !(protocol == location.protocol && host == location.host)
}


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

/**
 * Returns an array of the element's parent elements
 */
function parents(element) {
  var list = []
  while (element.parentNode && element.parentNode.nodeType == 1) {
    list.push(element = element.parentNode)
  }
  return list
}