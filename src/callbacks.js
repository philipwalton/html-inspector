function Callbacks() {
  this.handlers = []
}

Callbacks.prototype.add = function(fn) {
  this.handlers.push(fn)
}

Callbacks.prototype.remove = function(fn) {
  this.handlers = this.handlers.filter(function(handler) {
    return handler != fn
  })
}

Callbacks.prototype.fire = function(context, args) {
  this.handlers.forEach(function(handler) {
    handler.apply(context, args)
  })
}