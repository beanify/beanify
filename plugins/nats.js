const NATS = require('nats')

const connCodes = ['CONN_ERR', NATS.SECURE_CONN_REQ, NATS.NON_SECURE_CONN_REQ, NATS.CLIENT_CERT_REQ]

module.exports = (beanify, opts, done) => {

  const {$log:log}=beanify

  const nats = NATS.connect(opts)

  nats.on('connect', () => {
    log.info('NATS Connected!')
    done()
  })

  nats.on('error', (err) => {
    log.error(err,'Could not connect to NATS!')
    log.error("NATS Code: '%s', Message: %s", err.code, err.message)

    done(err)

    if (connCodes.indexOf(err.code) > -1) {
      beanify.close()
    }
  })

  beanify.onClose((instance, done) => {
    nats.close()
    done()
  })

  beanify.decorate('$nats',nats)

}
