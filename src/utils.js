/**
 * Convert an array like object to an array
 */
function toArray(arrayLike) {
  return [].slice.call(arrayLike)
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