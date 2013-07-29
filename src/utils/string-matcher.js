var isRegExp = require("mout/lang/isRegExp")

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

module.exports = foundIn
