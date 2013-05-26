function Reporter() {
  this._errors = []
}

Reporter.prototype.addError = function(rule, message, context) {
  this._errors.push({
    rule: rule,
    message: message,
    context: context
  })
}

Reporter.prototype.getErrors = function() {
  return this._errors
}