module.exports = function(HTMLHint) {
  const classValue = require('../classValue.ts')
  HTMLHint.addRule(classValue)
}
