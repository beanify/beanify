const beanifyPlugin = require('beanify-plugin')
const errors = require('../errors')
const Util = require('../util')

class ProcessChain {
  constructor ({ beanify, opts, done }) {
    this._parent = beanify
    this._opts = opts

    // when register route
    this._onRoute = [] // {route,log}

    // when inject
    this._onBeforeInject = [] // {context,options,log}
    this._onInject = [] // {context,natsRequest,log}
    this._onAfterInject = [] // {context,error,replys,log}

    // when request
    this._onRequest = [] // {natsRequest,natsReply,log}
    this._onBeforeHandler = [] // {context,natsRequest,log}
    this._onHandler = [] // {context,req,log}
    this._onAfterHandler = [] // {context,req,res,log}
    this._onResponse = [] // {context,natsResponse,log}

    // when request process error
    this._onError = [] // {err}

    this._types = [
      'onClose', // beanify avvio
      'onRoute', // register route
      'onBeforeInject', 'onInject', 'onAfterInject', // process inject
      'onRequest', 'onBeforeHandler', 'onHandler', 'onAfterHandler', 'onResponse', // process request
      'onError' // request process error
    ]

    setImmediate(done)
  }

  get $types () {
    return this._types
  }

  AddHook (type, handler) {
    if (Array.isArray(handler)) {
      handler.forEach((h) => this._add(type, h))
    } else {
      this._add(type, handler)
    }
  }

  RunHook (type, state, doneFunc) {
    if (this._types.indexOf(type) === -1) {
      throw new errors.BeanifyError(`Chain type is unknown : ${type}`)
    }
    if (type === 'onClose') {
      throw new errors.BeanifyError('onClose Hook called by avvio')
    }

    const funcs = this[`_${type}`]

    Util.RunFuncs(funcs, state, doneFunc)
  }

  _add (type, fn) {
    if (this._types.indexOf(type) === -1) {
      throw new errors.BeanifyError(`Chain type is unknown : ${type}`)
    }

    if (type === 'onClose') {
      this._parent.onClose(fn)
    } else {
      this[`_${type}`].push(fn)
    }
  }
}

module.exports = beanifyPlugin((beanify, opts, done) => {
  const chain = new ProcessChain({ beanify, opts, done })

  beanify.decorate('$chain', chain)
  beanify.decorate('addHook', chain.AddHook.bind(chain))
}, {
  name: 'beanify-chain',
  scoped: false
})
