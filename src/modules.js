function Modules() {}

Modules.prototype.add = function(name, module) {
  this[name] = module
}

Modules.prototype.extend = function(name, options) {
  if (typeof options == "function")
    options = options.call(this[name], this[name])
  extend(this[name], options)
}