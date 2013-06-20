function Rules() {}

Rules.prototype.add = function(name, config, fn) {
  if (typeof config == "function") {
    fn = config
    config = {}
  }
  this[name] = {
    name: name,
    config: config,
    fn: fn
  }
}

Rules.prototype.extend = function(name, options) {
  if (typeof options == "function")
    options = options.call(this[name].config, this[name].config)
  extend(this[name].config, options)
}