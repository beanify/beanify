const beanifyPlugin = require('beanify-plugin')
const Pino = require('pino')

module.exports = beanifyPlugin((beanify, opts, done) => {
  const logger = Pino(opts)

  beanify.decorate('$log', logger)

  done()
}, {
  name: 'beanify-logger',
  scoped: false
})
