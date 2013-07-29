;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){


    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    module.exports = kindOf;


},{}],2:[function(require,module,exports){
var kindOf = require('./kindOf');

    var _win = this;

    /**
     * Convert array-like object into array
     */
    function toArray(val){
        var ret = [],
            kind = kindOf(val),
            n;

        if (val != null) {
            if ( val.length == null || kind === 'String' || kind === 'Function' || kind === 'RegExp' || val === _win ) {
                //string, regexp, function have .length but user probably just want
                //to wrap value into an array..
                ret[ret.length] = val;
            } else {
                //window returns true on isObject in IE7 and may have length
                //property. `typeof NodeList` returns `function` on Safari so
                //we can't use it (#58)
                n = val.length;
                while (n--) {
                    ret[n] = val[n];
                }
            }
        }
        return ret;
    }
    module.exports = toArray;


},{"./kindOf":1}],3:[function(require,module,exports){
/**
 * Get an object representation of an element's attributes
 */
function getAttributes(element) {
  var map = element.attributes
    , len = map.length
    , i = 0
    , attr
    , attrs = {}

  // return an empty array if there are no attributes
  if (len === 0) return {}

  while (attr = map[i++]) {
    attrs[attr.name] = attr.value
  }
  return attrs
}

module.exports = getAttributes

},{}],4:[function(require,module,exports){
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

},{"mout/lang/toArray":2}],5:[function(require,module,exports){
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

module.exports = parents

},{}],6:[function(require,module,exports){
var getAttributes = require("../src/utils/dom/get-attributes")

describe("getAttributes", function() {
  it("returns an array of the element attributes, sorted alphabetically by class name", function() {
    var div = document.createElement("div")
    div.setAttribute("foo", "FOO")
    div.setAttribute("bar", "BAR")
    div.setAttribute("baz", "BAZ")
    expect(getAttributes(div)).to.deep.equal({
      "bar": "BAR",
      "baz": "BAZ",
      "foo": "FOO"
    })
  })
})

var matches = require("../src/utils/dom/matches")

describe("matches", function() {
  it("returns true if a DOM element matches any of the elements or selectors in the test object", function() {
    var div = document.createElement("div")
    div.setAttribute("foo", "FOO")
    expect(matches(div, "div[foo]")).to.equal(true)
    expect(matches(div, "div[bar]")).to.equal(false)

    expect(matches(document.body, ["html", "html > body"])).to.equal(true)
    expect(matches(document.body, [".body", ".html", "p"])).to.equal(false)

    div.innerHTML = "<p id='foo'>foo <em>bar</em></p>"
    expect(matches(div.querySelector("em"), ["#foo", "#foo > em"])).to.equal(true)
    expect(matches(div.querySelector("em"), [document.documentElement, document.body])).to.equal(false)

    expect(matches(div.querySelector("em"), ["#foo", "#foo > em"])).to.equal(true)

    expect(matches(div, null)).to.equal(false)
  })
})

var parents = require("../src/utils/dom/parents")

describe("parents", function() {
  it("returns an array of all the parent elements of the passed DOM element", function() {
    var rents
      , div = document.createElement("div")
    expect(parents(div)).to.deep.equal([])

    div.innerHTML = "<p id='foo'><span>foo <em>bar</em><span></p>"
    rents = parents(div.querySelector("em"))
    expect(rents.length).to.equal(3)
    expect(rents[0].nodeName.toLowerCase()).to.equal("span")
    expect(rents[1].nodeName.toLowerCase()).to.equal("p")
    expect(rents[2]).to.equal(div)

    expect(parents(document.querySelector("body > *")).length).to.equal(2)
    expect(parents(document.querySelector("body > *"))[0]).to.equal(document.body)
    expect(parents(document.querySelector("body > *"))[1]).to.equal(document.documentElement)

  })
})
},{"../src/utils/dom/get-attributes":3,"../src/utils/dom/matches":4,"../src/utils/dom/parents":5}]},{},[6])
;