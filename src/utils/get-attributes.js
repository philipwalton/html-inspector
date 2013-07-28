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

module.exports = getAttributes
