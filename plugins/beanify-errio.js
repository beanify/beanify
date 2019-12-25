const beanifyPlugin = require('beanify-plugin')
const Errio = require('errio')
const errors = require('../errors')

module.exports = beanifyPlugin((beanify, opts, done) => {
  Errio.setDefaults(opts)

  for (const err in errors) {
    Errio.register(errors[err])
  }

  beanify.decorate('$errio', Errio)

  done()
}, {
  name: 'beanify-errio',
  scoped: false
})
