/**
 * Convert an array like object to an array
 */
function toArray(arrayLike) {
  return arrayLike ? [].slice.call(arrayLike) : []
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
 * Given a string and a RegExp or a list of strings or RegExps,
 * does the string match any of the items in the list?
 */
function foundIn(needle, haystack) {
  // if haystack is a RegExp and not an array, just compare againt it
  if (isRegExp(haystack)) return haystack.test(needle)

  // otherwise check each item in the list
  return haystack.some(function(item) {
    return isRegExp(item) ? item.test(needle) : needle === item
  })
}