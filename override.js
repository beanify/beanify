const {
  kBeanifyPluginMeta,
  kBeanifyPlugins,
  kBeanifyChildren,
  kBeanifyName,
  kBeanifyRouterPrefix
} = require('./symbols')
const { PluginVersioMismatchError } = require('./errors')
const { initQueue } = require('./queue')
const nuid = require('nuid')
const semver = require('semver')

module.exports = function avvioOverride (old, fn, opts) {
  const meta = fn[kBeanifyPluginMeta]

  // not meta
  if (!meta) {
    return old
  }

  // check version
  if (meta.beanify && !semver.satisfies(old.$version, meta.beanify)) {
    throw new PluginVersioMismatchError(meta.name, meta.beanify, old.$version)
  }

  if (meta.name) {
    // push name
    old[kBeanifyPlugins].push(meta.name)
  }

  // is scoped
  if (meta.scoped === true) {
    return old
  }

  let prefix = opts.prefix
  if (typeof meta.prefix === 'string') {
    prefix = meta.prefix
  }

  // create instance
  const ins = Object.create(old)
  old[kBeanifyChildren].push(ins)

  ins[kBeanifyName] = nuid.next()
  ins[kBeanifyChildren] = []
  ins[kBeanifyPlugins] = []
  ins[kBeanifyRouterPrefix] = buildRouterPrefix(
    old[kBeanifyRouterPrefix],
    prefix
  )

  // init queue
  initQueue.call(ins)

  return ins
}

function buildRouterPrefix (iPrefix, pPrefix) {
  if (!pPrefix || pPrefix === '') {
    return iPrefix
  }

  if (iPrefix === '') {
    return pPrefix || ''
  }

  return `${iPrefix}.${pPrefix}`
}
