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
