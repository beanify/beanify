const AVVIO = require('avvio')

const {
  kBeanifyRoot,
  kBeanifyOptions,
  kBeanifyRouterPrefix,
  kBeanifyVersion,
  kBeanifyChildren,
  kBeanifyPlugins,
  kBeanifyAvvio,
  kBeanifyName
} = require('./symbols')

const { DecorateExistsError } = require('./errors')

const beanifyOptions = require('./beanify-options')
const decorates = require('./decorates')
const plugins = require('./plugins')
const { initQueue, addRoute, addInject, attachAvvio } = require('./queue')
const { initHooks } = require('./hooks')
const { initBeanifyProperties } = require('./properties')

const nuid = require('nuid')
const avvioOverride = require('./override')
const printTree = require('./print-tree')

function Beanify (opts) {
  // new instace
  if (!(this instanceof Beanify)) {
    return new Beanify(opts)
  }

  this[kBeanifyRoot] = this
  this[kBeanifyName] = nuid.next()
  this[kBeanifyOptions] = beanifyOptions(opts)
  this[kBeanifyRouterPrefix] = opts.router.prefix
  this[kBeanifyVersion] = require('./package.json').version
  this[kBeanifyChildren] = []
  this[kBeanifyPlugins] = []
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
  if (prop in this.$root) {
    throw new DecorateExistsError()
  }

  this.$root[prop] = value
}

Beanify.prototype.hasDecorator = function (prop) {
  return prop in this.$root
}

Beanify.prototype.route = function (opts, handler) {
  addRoute.call(this, opts || {}, handler)
  return this
}

Beanify.prototype.inject = function (opts, handler) {
  return addInject.call(this, opts || {}, handler)
}

Beanify.prototype.printTree = function () {
  this.$log.info('----------printTree----------')
  printTree({
    ins: this,
    key: kBeanifyChildren,
    format: (pad, ins) => {
      this.$log.info(`${pad}${ins.$name}`)
      const plns = ins.$plugins
      const pPad = pad.padEnd(pad.length + 2, '-')
      for (const pln of plns) {
        this.$log.info(`${pPad}[${pln}]`)
      }
    }
  })
}

module.exports = Beanify
