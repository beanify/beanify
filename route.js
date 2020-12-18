const path = require('path')
const {
  kRouteAttribute,
  kRouteSid,
  kRouteRequest,
  kRouteReply,
  kReplyFlag
} = require('./symbols')

function Route (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }

  this[kRouteAttribute] = this.attribute
  delete this.attribute
}

// Route.prototype.inject = function () {
//   for (const k in this) {
//     console.log({
//       k
//     })
//   }
//   console.log(this[kRouteBeanify].$name)
// }

function doHandler (req, rep) {
  return new Promise((resolve, reject) => {
    try {
      const pLike = this.handler(req, rep)
      if (pLike && typeof pLike.then === 'function') {
        pLike
          .then(data => {
            rep.send(data)
          })
          .catch(e => {
            reject(e)
          })
      } else {
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

function registerRouteFlow (next) {
  const { url, $timeout, $beanify } = this
  const { $nats, $log } = $beanify
  const { requestComing, addRoute } = require('./queue')
  let { $queue } = this
  if (!$queue) {
    $queue = require(path.join(process.cwd(), 'package.json')).name
  }
  const urlQueue = `${$queue}.${url}`
  this[kRouteSid] = $nats.subscribe(
    url,
    {
      queue: urlQueue
    },
    requestComing.bind(this)
  )
  let tmrId = null
  $nats.flush(() => {
    if ($timeout > 0 && tmrId !== null) {
      clearTimeout(tmrId)
      tmrId = null
    }
    $log.info(`route: ${url}`)
    next()
  })
  if ($timeout > 0) {
    tmrId = setTimeout(() => {
      tmrId = null
      $log.error(`route timeout: ${url}`)
      addRoute.call($beanify, this)
      next()
    }, $timeout)
  }
}

function doRouteHandlerFlow (next) {
  const req = this[kRouteRequest]
  const rep = this[kRouteReply]
  rep[kReplyFlag] = true
  doHandler
    .call(this, req, rep)
    .then(() => next())
    .catch(e => next(e))
    .finally(() => {
      rep[kReplyFlag] = false
    })
}

module.exports = {
  Route,
  registerRouteFlow,
  doRouteHandlerFlow
}
