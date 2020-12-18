const {
  kQueueRoutes,
  kQueueInjects,
  kBeanifyRoutes,
  kBeanifyChildren,
  kBeanifyRouterPrefix,
  kRouteBeanify,
  kRouteRequest,
  kRouteReply,
  kRouteAttribute,
  kInjectAttribute,
  kInjectBeanify,
  kInjectParent,
  kInjectFlag,
  kRequestRoute,
  kReplyRoute,
  kReplyTo,
  kInjectContext
} = require('./symbols')

const {
  RouteOptionsError,
  InjectOptionsError,
  HookCallbackError
} = require('./errors')
const { Route, registerRouteFlow, doRouteHandlerFlow } = require('./route')
const { Inject, injectRequestFlow } = require('./inject')

const Clone = require('clone')
const FastQ = require('fastq')
const AJV = require('ajv')
const Merge = require('merge')
const asyncLib = require('async')
const Request = require('./request')
const { isArrow } = require('extra-function')
const { Reply } = require('./reply')

const {
  routeHooks,
  injectHooks,
  throwError,
  onRouteFlow,
  onBeforeInjectFlow,
  onAfterInjectFlow,
  onBeforeHandlerFlow,
  onAfterHandlerFlow
} = require('./hooks')
const {
  initInjectProperties,
  initRouteProperties,
  initReplyProperties
} = require('./properties')

const ajv = new AJV({ useDefaults: true, coerceTypes: true })

function noop () {}

function activeQueue (name) {
  return new Promise(resolve => {
    const children = this[kBeanifyChildren]
    const queue = this[name]
    queue.drain = async () => {
      for (const child of children) {
        await activeQueue.call(child, name)
      }
      resolve()
      queue.drain = noop
    }
    queue.resume()
  })
}

function buildAjvErrorsMsg (errs) {
  const es = []
  errs.forEach(e => {
    es.push(`schema path: [${e.schemaPath}] message: ${e.message}`)
  })
  return es.join('\n')
}

function requestComing (payload, replyTo, url) {
  const route = Object.create(this)
  route.handler = this.handler.bind(route)

  const nattrs = payload.attrs || {}
  const oattrs = Clone(this[kRouteAttribute])
  const cattrs = Merge.recursive(oattrs, nattrs)

  const req = new Request()
  req[kRequestRoute] = route
  req.body = payload.body
  req.url = url
  const rep = new Reply()

  initReplyProperties.call(rep)
  rep[kReplyRoute] = route
  rep[kReplyTo] = replyTo

  route[kRouteAttribute] = cattrs
  route[kRouteRequest] = req
  route[kRouteReply] = rep

  asyncLib.series(
    [
      onBeforeHandlerFlow.bind(route),
      doRouteHandlerFlow.bind(route),
      onAfterHandlerFlow.bind(route)
    ],
    e => {
      if (e) {
        rep.error(e)
        throwError(this.$beanify, e)
      }
    }
  )
}

function routerWorker (route, done) {
  asyncLib.series(
    [onRouteFlow.bind(route), registerRouteFlow.bind(route)],
    e => {
      if (e) {
        throwError(this, e)
      } else {
        done()
      }
    }
  )
}

function injectWorker (inject, done) {
  asyncLib.series(
    [
      onBeforeInjectFlow.bind(inject),
      injectRequestFlow.bind(inject),
      onAfterInjectFlow.bind(inject)
    ],
    e => {
      if (e) {
        throwError(this, e)
      }
    }
  )
  done()
}

function attachAvvio () {
  const { $avvio, $log } = this.$root
  $avvio._readyQ.unshift(async () => {
    $avvio._readyQ.pause()
    $log.info('register routes')
    await activeQueue.call(this.$root, kQueueRoutes)
    await activeQueue.call(this.$root, kQueueInjects)
    $avvio._readyQ.resume()
  })
}

function initQueue () {
  this[kQueueRoutes] = FastQ(this, routerWorker, 1)
  this[kQueueRoutes].pause()

  this[kQueueInjects] = FastQ(this, injectWorker, 1)
  this[kQueueInjects].pause()
}

function addRoute (opts, handler) {
  const schema = require('./schemas/route-options.json')
  ajv.compile(schema)(opts)
  if (!ajv.validate(schema, opts)) {
    const e = new RouteOptionsError(buildAjvErrorsMsg(ajv.errors))
    return throwError(this, e)
  }

  const route = new Route(opts)
  route[kRouteBeanify] = this
  initRouteProperties.call(route)

  if (!route.handler && typeof handler === 'function') {
    route.handler = handler
  }

  if (typeof route.handler !== 'function') {
    const e = new RouteOptionsError(
      `missing handler function for ${route.url} route`
    )
    return throwError(this, e)
  }

  if (isArrow(route.handler)) {
    const e = new RouteOptionsError(
      `handler for ${route.url} route not allow arrow function`
    )
    return throwError(this, e)
  }

  for (const hk of routeHooks) {
    if (hk in route) {
      if (typeof route[hk] !== 'function') {
        route[hk] = noop
        break
      }

      if (isArrow(route[hk])) {
        const e = new HookCallbackError()
        return throwError(this, e)
      }
    }
  }

  const prefix = this[kBeanifyRouterPrefix]

  if (route.$usePrefix && prefix && prefix !== '') {
    route.url = `${prefix}.${route.url}`
  }

  if (route.$queue) {
    if (route.$queue === '') {
      delete route.$queue
    } else {
      route.$pubsub = true
    }
  }

  this[kBeanifyRoutes].push(route.url)
  this[kQueueRoutes].push(route)
}

function addInject (opts, handler, parent) {
  const schema = require('./schemas/inject-options.json')
  ajv.compile(schema)(opts)
  if (!ajv.validate(schema, opts)) {
    const e = new RouteOptionsError(buildAjvErrorsMsg(ajv.errors))
    throwError(this, e)
    return this
  }

  const inject = new Inject(opts)
  inject[kInjectBeanify] = this
  inject[kInjectParent] = parent
  inject[kInjectFlag] = false
  initInjectProperties.call(inject)

  if (parent instanceof Inject) {
    if (!inject[kInjectContext]) {
      inject[kInjectContext] = parent[kInjectContext]
    }
  }

  if (typeof inject.handler !== 'function') {
    delete inject.handler
  }

  if (!inject.handler && typeof handler === 'function') {
    inject.handler = handler
  }

  let returned = this
  if (!inject.handler) {
    returned = new Promise((resolve, reject) => {
      function _handler (err, data) {
        if (this.$parent) {
          this.$parent[kInjectAttribute] = this.$attribute
          this.$parent[kInjectContext] = this.$context
        }

        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      }

      inject.handler = _handler
    })
  }

  if (isArrow(inject.handler)) {
    const e = new InjectOptionsError(
      `handler for ${inject.url} inject not allow arrow function`
    )
    throwError(this, e)
    return returned
  }

  for (const hk of injectHooks) {
    if (hk in inject) {
      if (typeof inject[hk] !== 'function') {
        inject[hk] = noop
        break
      }

      if (isArrow(inject[hk])) {
        const e = new HookCallbackError()
        throwError(this, e)
        return returned
      }
    }
  }

  const prefix = this[kBeanifyRouterPrefix]

  if (inject.$usePrefix && prefix && prefix !== '') {
    inject.url = `${prefix}.${inject.url}`
  }

  inject.handler = inject.handler.bind(inject)
  this[kQueueInjects].push(inject)
  return returned
}

module.exports = {
  initQueue,
  attachAvvio,
  addRoute,
  addInject,
  requestComing
}
