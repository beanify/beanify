const logger = require('./logger')
const errio = require('./errio')

module.exports = function () {
  logger.call(this)
  errio.call(this)
}
