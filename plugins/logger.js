const Pino = require('pino')

module.exports = (beanify, opts, done) => {
  const logger = Pino(opts)

  beanify.decorate('$log', logger)

  beanify.$log.debug('BeanifyOptions',beanify.$options)

  done()
}
