function Listener() {
  this._events = {}
}

Listener.prototype.on = function(event, fn) {
  this._events[event] || (this._events[event] = new Callbacks())
  this._events[event].add(fn)
}

Listener.prototype.off = function(event, fn) {
  this._events[event] && this._events[event].remove(fn)
}

Listener.prototype.trigger = function(event, context, args) {
  this._events[event] && this._events[event].fire(context, args)
}
