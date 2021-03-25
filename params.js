const { kParamsPaths, kRouteRequest } = require('./symbols')

function onParamsParserFlow (next) {
  const route = this
  const segs = this.url.split('.')
  this[kParamsPaths] = []
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

  next()
}

function onParamsSerializer (next) {
  const req = this[kRouteRequest]
  const paths = this[kParamsPaths]

  if (paths.length > 0) {
    const segs = req.url.split('.')
    req.params = {}
    paths.forEach(path => {
      req.params[path.name] = segs[path.index]
    })
  }

  next()
}

module.exports = {
  onParamsParserFlow,
  onParamsSerializer
}
