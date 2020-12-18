const NATS = require('nats')
const { kBeanifyNats } = require('../symbols')

const natsErrorCodes = [
  NATS.CONN_ERR,
  NATS.SECURE_CONN_REQ,
  NATS.NON_SECURE_CONN_REQ,
  NATS.CLIENT_CERT_REQ
]

module.exports = function (ins, opts, done) {
  ins.$log.info('decorate $nats')

  const nats = NATS.connect(opts)

  nats.on('connect', () => {
    ins.$log.debug('$nats connected!')
    done()
  })

  nats.on('error', err => {
    ins.$log.error('$nats error!')
    ins.$log.error(`$nats code: ${err.code} , message:${err.message}`)
    done(err)

    if (natsErrorCodes.indexOf(err.code) > -1) {
      ins.close()
    }
  })

  ins.addHook('onClose', function () {
    nats.close()
  })

  ins[kBeanifyNats] = nats
}
