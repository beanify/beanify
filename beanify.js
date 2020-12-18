const AVVIO = require('avvio')

const {
  kBeanifyRoot,
  kBeanifyOptions,
  kBeanifyRouterPrefix,
  kBeanifyVersion,
  kBeanifyChildren,
  kBeanifyRoutes,
  kBeanifyAvvio,
  kBeanifyName,
  kBeanifyDecorates
} = require('./symbols')

const { DecorateExistsError } = require('./errors')

const beanifyOptions = require('./beanify-options')
const decorates = require('./decorates')
const plugins = require('./plugins')
const { initQueue, addRoute, addInject, attachAvvio } = require('./queue')
const { initHooks } = require('./hooks')
const { initBeanifyProperties } = require('./properties')

const avvioOverride = require('./override')

function Beanify (opts) {
  // new instace
  if (!(this instanceof Beanify)) {
    return new Beanify(opts)
  }

  this[kBeanifyRoot] = this
  this[kBeanifyName] = 'root'
  this[kBeanifyOptions] = beanifyOptions(opts)
  this[kBeanifyRouterPrefix] = opts.router.prefix
  this[kBeanifyVersion] = require('./package.json').version
  this[kBeanifyChildren] = []
  this[kBeanifyRoutes] = []
  this[kBeanifyDecorates] = []
  this[kBeanifyAvvio] = AVVIO(this, {
    expose: {
      use: 'register',
      onClose: '_onClose'
    },
    autostart: true,
    timeout: 15000
  })
  this[kBeanifyAvvio].override = avvioOverride

  initBeanifyProperties.call(this)
  decorates.call(this)
  initHooks.call(this)
  initQueue.call(this)
  attachAvvio.call(this)
  plugins.call(this)
}

Beanify.prototype.decorate = function (prop, value) {
  if (prop in this) {
    throw new DecorateExistsError()
  }

  this[prop] = value
  this[kBeanifyDecorates].push(prop)
  return this
}

Beanify.prototype.hasDecorator = function (prop) {
  return prop in this
}

Beanify.prototype.route = function (opts, handler) {
  addRoute.call(this, opts || {}, handler)
  return this
}

Beanify.prototype.inject = function (opts, handler) {
  return addInject.call(this, opts || {}, handler)
}

Beanify.prototype.print = function () {
  const tab = 4
  const tabPad = '|'.padEnd(tab, ' ')
  const tabPrefix = '|'.padEnd(tab, '-')

  function printArrays (level, child, key, name) {
    const items = child[key]
    if (items.length > 0) {
      const rPad = ''.padEnd((level + 1) * tab, tabPad)
      const rLine = `${rPad}${tabPrefix}${name}`
      child.$log.info(rLine)

      for (const url of items) {
        const uPad = ''.padEnd(rPad.length + tab, tabPad)
        const uLine = `${uPad}${tabPrefix}${url}`
        child.$log.info(uLine)
      }
    }
  }

  function printPrefix (level, child) {
    const prefix = child[kBeanifyRouterPrefix]
    if (prefix && prefix !== '') {
      const pPad = ''.padEnd((level + 1) * tab, tabPad)
      const pLine = `${pPad}${tabPrefix}prefix`
      child.$log.info(pLine)

      const uPad = ''.padEnd(pPad.length + tab, tabPad)
      const uLine = `${uPad}${tabPrefix}${prefix}`
      child.$log.info(uLine)
    }
  }

  function printChild (level, child) {
    const nPad = ''.padEnd(level * tab, tabPad)
    if (level === 0) {
      child.$log.info(`${nPad}[${child.$name}]`)
    } else {
      child.$log.info(`${nPad}${tabPrefix}[${child.$name}]`)
    }
    printArrays(level, child, kBeanifyRoutes, 'routes')
    printArrays(level, child, kBeanifyDecorates, 'decorates')
    printPrefix(level, child)

    const children = child[kBeanifyChildren]
    children.forEach(child => {
      printChild(level + 1, child)
    })
  }

  printChild(0, this)
}

module.exports = Beanify
