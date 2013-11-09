// used to parse URLs
var link = document.createElement("a")

/**
 * Tests whether a URL is cross-origin
 * Same origin URLs must have the same protocol and host
 * (note: host include hostname and port)
 */
module.exports = function(url) {
  link.href = url
  return !(link.protocol == location.protocol && link.host == location.host)
}
