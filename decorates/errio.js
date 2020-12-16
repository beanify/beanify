const Errio = require('errio')
const errors = require('../errors')

module.exports = function () {
  this.$log.info('decorate $errio')
  Errio.setDefaults(this.$options.errio)
  for (const en in errors) {
    this.$log.debug(`$errio.register: ${en}`)
    Errio.register(errors[en])
  }
  this.decorate('$errio', Errio)
}
