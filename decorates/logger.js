const Pino = require('pino')

module.exports = function () {
  const pino = Pino(this.$options.pino)
  this.decorate('$log', pino)
}
