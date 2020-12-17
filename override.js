const {
  kBeanifyPluginMeta,
  kBeanifyRoutes,
  kBeanifyChildren,
  kBeanifyName,
  kBeanifyRouterPrefix,
  kBeanifyDecorates
} = require('./symbols')
const { PluginVersioMismatchError } = require('./errors')
const { initQueue } = require('./queue')
const semver = require('semver')
const Merge = require('merge')

module.exports = function avvioOverride (old, fn, opts) {
  const meta = fn[kBeanifyPluginMeta]

  // merge options
  Merge.recursive(opts, meta || {})

  if (!opts.name) {
    return old
  }

  // check version
  if (opts.beanify && !semver.satisfies(old.$version, opts.beanify)) {
    throw new PluginVersioMismatchError(opts.name, opts.beanify, old.$version)
  }

  // create instance
  const ins = Object.create(old)
  old[kBeanifyChildren].push(ins)

  ins[kBeanifyName] = opts.name
  ins[kBeanifyChildren] = []
  ins[kBeanifyRoutes] = []
  ins[kBeanifyDecorates] = []
  ins[kBeanifyRouterPrefix] = buildRouterPrefix(
    old[kBeanifyRouterPrefix],
    opts.prefix
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
