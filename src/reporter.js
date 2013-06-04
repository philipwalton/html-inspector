function Reporter() {
  this._errors = []
}

Reporter.prototype.warn = function(rule, message, context) {
  this._errors.push({
    rule: rule,
    message: message,
    context: context
  })
}

Reporter.prototype.getWarnings = function() {
  return this._errors
}