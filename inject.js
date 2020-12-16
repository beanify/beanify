const { kInjectAttribute, kInjectContext, kInjectFlag } = require('./symbols')

function Inject (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }

  this[kInjectAttribute] = this.attribute
  delete this.attribute

  this[kInjectContext] = this.context
  delete this.context
}

Inject.prototype.inject = function (opts, handler) {
  if (!this[kInjectFlag]) {
    return
  }
  const { addInject } = require('./queue')
  const { $beanify } = this
  const pLike = addInject.call($beanify, opts, handler, this)

  if (pLike instanceof Promise) {
    return pLike
  }

  return this
}

module.exports = Inject
