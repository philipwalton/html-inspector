var mixIn = require("mout/object/mixIn")

function Modules() {}

Modules.prototype.add = function(obj) {
  this[obj.name] = obj.module
}

Modules.prototype.extend = function(name, options) {
  if (typeof options == "function")
    options = options.call(this[name], this[name])
  mixIn(this[name], options)
}

module.exports = Modules