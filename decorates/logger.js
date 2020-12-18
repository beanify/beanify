const Pino = require('pino')
const { kBeanifyPino } = require('../symbols')
module.exports = function () {
  const pino = Pino(this.$options.pino)
  this[kBeanifyPino] = pino
}
