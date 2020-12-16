const { isArrow } = require('extra-function')
const asyncLib = require('async')

const { kBeanifyRunHooks, kBeanifyRunHooksAsync } = require('./symbols')
const { HookCallbackError } = require('./errors')

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
  this.decorate('addHook', addHook.bind(this))

  this.$root[kBeanifyRunHooks] = runHooks
  this.$root[kBeanifyRunHooksAsync] = runHooksAsync

  this._onClose((ins, done) => {
    runHooks('onClose', ins, done)
  })
  this.addHook('onError', printError)
}

module.exports = {
  initHooks,
  routeHooks,
  injectHooks
}
