(function(root, factory) {
  if(typeof exports === 'object') {
    module.exports = factory();
  } else {
    // Not used (yet)
  }
}(this, function() {

  var write = function(errors) {
    errors.forEach(function(error) {
      console.log('[' + error.rule + '] ' + error.message);
    })
  }

  return {
    write: write
  }

}));
