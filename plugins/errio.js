const Errio = require('errio')
const errors = require('../errors')

module.exports = (beanify, opts, done) => {
  Errio.setDefaults(opts)

  for (const err in errors) {
    Errio.register(errors[err])
  }

  beanify.decorate('$errio', Errio)

  done()
}
