const { isArrow } = require('extra-function')
const asyncLib = require('async')
const { replySending } = require('./reply')

const { HookCallbackError } = require('./errors')
const {
  kInjectTime,
  kRouteTime,
  kRouteRequest,
  kRouteReply,
  kReplySent
} = require('./symbols')

const hooks = {
  onClose: [],
  onRoute: [],
  onError: [],

  onBeforeHandler: [],
  onAfterHandler: [],

  onBeforeInject: [],
  onAfterInject: []
}

const routeHooks = ['onError', 'onBeforeHandler', 'onAfterHandler']
const injectHooks = ['onError', 'onBeforeInject', 'onAfterInject']

function printError (e) {
  this.$log.error(e)
}

function addHook (name, fn) {
  if (!(name in hooks)) {
    return
  }

  if (isArrow(fn)) {
    const e = new HookCallbackError()
    return runHooks('onError', this, null, e)
  }

  if (typeof fn !== 'function') {
    return
  }

  hooks[name].push(fn)
}

function runHooks (name, ins, done, ...args) {
  if (!(name in hooks)) {
    return
  }

  const doHooks = [...hooks[name]]
  if (ins && name in ins) {
    const insHook = ins[name]
    if (typeof insHook === 'function') {
      doHooks.push(insHook)
    }
  }

  let doCount = 0
  asyncLib.whilst(
    function (next) {
      next(null, doCount < doHooks.length)
    },
    function (next) {
      function done (e) {
        doCount++
        next(e)
      }
      try {
        let doHook = doHooks[doCount]
        if (ins) {
          doHook = doHook.bind(ins)
        }
        const pLike = doHook(...args)
        if (pLike && typeof pLike.then === 'function') {
          pLike.then(() => done()).catch(e => done(e))
        } else {
          done()
        }
      } catch (e) {
        done(e)
      }
    },
    function (err) {
      if (done) {
        done(err)
      }
    }
  )
}

function runHooksAsync (name, ins, ...args) {
  return new Promise((resolve, reject) => {
    runHooks(
      name,
      ins,
      err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
      ...args
    )
  })
}

function initHooks () {
  this.$log.info('decorate addHook')
  this.addHook = addHook.bind(this)

  this._onClose((ins, done) => {
    runHooks('onClose', ins, done)
  })
  this.addHook('onError', printError)
}

function throwError (ins, e) {
  runHooks('onError', ins, null, e)
}

function onRouteFlow (next) {
  const { $beanify } = this
  runHooksAsync('onRoute', $beanify, this)
    .then(() => next())
    .catch(e => next(e))
}

function onBeforeInjectFlow (next) {
  const { url } = this
  const beginTime = Date.now()
  this.$log.debug(`inject begin(${beginTime}): ${url}`)
  this[kInjectTime] = beginTime
  runHooksAsync('onBeforeInject', this)
    .then(() => next())
    .catch(e => next(e))
}

function onAfterInjectFlow (next) {
  runHooksAsync('onAfterInject', this)
    .then(() => next())
    .catch(e => next(e))
    .finally(() => {
      const { url } = this
      const btime = this[kInjectTime]
      const etime = Date.now()
      this.$log.debug(`inject finish(${etime}): ${url}`)
      this.$log.info(`inject duration(${(etime - btime) / 1000}ms): ${url}`)
    })
}

function onBeforeHandlerFlow (next) {
  const { url } = this
  const req = this[kRouteRequest]
  const rep = this[kRouteReply]
  const beginTime = Date.now()
  this.$log.debug(`request incomming(${beginTime}): ${url}`)
  this[kRouteTime] = beginTime
  runHooksAsync('onBeforeHandler', this, req, rep)
    .then(() => next())
    .catch(e => next(e))
}

function onAfterHandlerFlow (next) {
  const req = this[kRouteRequest]
  const rep = this[kRouteReply]
  const { url } = this
  runHooksAsync('onAfterHandler', this, req, rep)
    .then(() => {
      rep[kReplySent] = true
      replySending.call(rep, {
        data: rep.$data,
        attrs: this.$attribute
      })
    })
    .catch(e => next(e))
    .finally(() => {
      const btime = this[kRouteTime]
      const etime = Date.now()
      this.$log.debug(`request completed(${etime}): ${url}`)
      this.$log.info(`request duration(${(etime - btime) / 1000}ms):${url}`)
    })
}

module.exports = {
  initHooks,
  routeHooks,
  injectHooks,
  throwError,
  onRouteFlow,
  onBeforeInjectFlow,
  onAfterInjectFlow,
  onBeforeHandlerFlow,
  onAfterHandlerFlow
}
