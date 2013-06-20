var no = { op: function(){}}

function parseHTML(string) {
  var container = document.createElement("div")
  container.innerHTML = string
  return container.firstChild
}