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
