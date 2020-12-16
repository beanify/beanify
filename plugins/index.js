const nats = require('./nats')

module.exports = function () {
  this.register(nats, this.$options.nats)
}
