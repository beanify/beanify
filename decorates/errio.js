const Errio = require('errio')
const errors = require('../errors')
const { kBeanifyErrio } = require('../symbols')

module.exports = function () {
  this.$log.info('decorate $errio')
  Errio.setDefaults(this.$options.errio)
  for (const en in errors) {
    this.$log.debug(`$errio.register: ${en}`)
    Errio.register(errors[en])
  }
  this[kBeanifyErrio] = Errio
}
