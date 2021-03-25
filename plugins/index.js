const nats = require('./nats')
const params = require('./params')

module.exports = function () {
  this.register(nats, this.$options.nats)
  this.register(params, {})
}
