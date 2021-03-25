const { kParamsPaths } = require('../symbols')

module.exports = async function (beanify, opts) {
  beanify.addHook('onRoute', function (route) {
    const segs = route.url.split('.')
    route[kParamsPaths] = []
    route.url = segs
      .map((seg, idx) => {
        if (seg.startsWith(':')) {
          route[kParamsPaths].push({
            index: idx,
            name: seg.substr(1)
          })
          return '*'
        }
        return seg
      })
      .join('.')
  })

  beanify.addHook('onBeforeHandler', function (req) {
    const paths = this[kParamsPaths]

    if (paths.length > 0) {
      const segs = req.url.split('.')
      req.params = {}
      paths.forEach(path => {
        req.params[path.name] = segs[path.index]
      })
    }
  })
}
