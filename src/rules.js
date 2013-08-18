var mixIn = require("mout/object/mixIn")

function Rules() {}

Rules.prototype.add = function(rule, config, func) {
  if (typeof rule == "string") {
    if (typeof config == "function") {
      func = config
      config = {}
    }
    this[rule] = {
      name: rule,
      config: config,
      func: func
    }
  }
  else {
    this[rule.name] = {
      name: rule.name,
      config: rule.config,
      func: rule.func
    }
  }
}

Rules.prototype.extend = function(name, options) {
  if (typeof options == "function")
    options = options.call(this[name].config, this[name].config)
  mixIn(this[name].config, options)
}

module.exports = Rules
