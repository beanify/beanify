const {
  kQueueRoutes,
  kQueueInjects,
  kBeanifyRoutes,
  kBeanifyChildren,
  kBeanifyRouterPrefix,
  kRouteBeanify,
  kBeanifyRunHooks,
  kBeanifyRunHooksAsync,
  kRouteSid,
  kRouteAttribute,
  kInjectAttribute,
  kInjectBeanify,
  kInjectParent,
  kInjectFlag,
  kRequestRoute,
  kReplyRoute,
  kReplyTo,
  kReplySent,
  kReplyFlag,
  kInjectContext
} = require('./symbols')

const {
  RouteOptionsError,
  InjectOptionsError,
  InjectTimeoutError,
  HookCallbackError
} = require('./errors')
const Route = require('./route')
const Inject = require('./inject')

const path = require('path')
const FastQ = require('fastq')
const AJV = require('ajv')
const { isArrow } = require('extra-function')

const ajv = new AJV({ useDefaults: true, coerceTypes: true })
const { routeHooks, injectHooks } = require('./hooks')
const {
  initInjectProperties,
  initRouteProperties,
  initReplyProperties
} = require('./properties')
const Merge = require('merge')
const Request = require('./request')
const { Reply, replySending } = require('./reply')

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

async function requestComing (payload, replyTo, url) {
  const route = Object.create(this)
  route.handler = this.handler.bind(route)
  const $root = this.$beanify

  const beginTime = Date.now()
  this.$log.debug(`request incomming(${beginTime}): ${url}`)

  const nattrs = payload.attrs || {}
  const oattrs = this[kRouteAttribute]

  const cattrs = Merge.recursive(nattrs, oattrs)
  route[kRouteAttribute] = cattrs

  const req = new Request()
  req[kRequestRoute] = route
  req.body = payload.body
  req.url = url

  const rep = new Reply()
  initReplyProperties.call(rep)
  rep[kReplyRoute] = route
  rep[kReplyTo] = replyTo

  let hasErr = await $root[kBeanifyRunHooksAsync](
    'onBeforeHandler',
    route,
    req,
    rep
  )
    .then(() => false)
    .catch(e => {
      rep.error(e)
      $root[kBeanifyRunHooks]('onError', $root, null, e)
      return true
    })

  if (hasErr) {
    return
  }

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

  rep[kReplyFlag] = true
  hasErr = await doHandler
    .call(route, req, rep)
    .then(() => false)
    .catch(e => {
      rep.error(e)
      $root[kBeanifyRunHooks]('onError', $root, null, e)
      return true
    })
  rep[kReplyFlag] = false

  if (hasErr) {
    return
  }

  hasErr = await $root[kBeanifyRunHooksAsync]('onAfterHandler', route, req, rep)
    .then(() => false)
    .catch(e => {
      rep.error(e)
      $root[kBeanifyRunHooks]('onError', $root, null, e)
      return true
    })

  if (!hasErr) {
    rep[kReplySent] = true
    replySending.call(rep, rep[kReplyTo], {
      data: rep.$data,
      attrs: route.$attribute
    })
  }

  const endTime = Date.now()
  this.$log.debug(`request completed(${endTime}): ${url}`)
  this.$log.info(`request duration(${(endTime - beginTime) / 1000}ms):${url}`)
}

function requestSending (url, payload) {
  return new Promise((resolve, reject) => {
    const { $nats } = this
    $nats.publish(url, payload, e => {
      if (e) {
        reject(e)
      } else {
        resolve()
      }
    })
  })
}

function requestBlockSending (url, payload, opts) {
  return new Promise((resolve, reject) => {
    const { $nats } = this
    const inbox = $nats.request(url, payload, opts, reply => {
      resolve(reply)
    })
    $nats.timeout(inbox, opts.timeout, 1, () => {
      const e = new InjectTimeoutError(url)
      reject(e)
    })
  })
}

async function routerWorker (route, done) {
  const hasErr = await this.$root[kBeanifyRunHooksAsync]('onRoute', this, route)
    .then(() => false)
    .catch(e => {
      this.$root[kBeanifyRunHooks]('onError', this, null, e)
      return true
    })

  if (hasErr) {
    return done()
  }

  const { $nats, $log } = this.$root
  const { url, $timeout } = route
  let { $queue } = route

  if (!$queue) {
    $queue = require(path.join(process.cwd(), 'package.json')).name
  }

  const urlQueue = `${$queue}.${url}`
  route[kRouteSid] = $nats.subscribe(
    url,
    {
      queue: urlQueue
    },
    requestComing.bind(route)
  )

  let tmrId = null
  $nats.flush(() => {
    if ($timeout > 0 && tmrId !== null) {
      clearTimeout(tmrId)
      tmrId = null
    }
    $log.info(`route: ${url}`)
    done()
  })

  if ($timeout > 0) {
    tmrId = setTimeout(() => {
      tmrId = null
      $log.error(`route timeout: ${url}`)
      addRoute.call(this, route)
      done()
    }, $timeout)
  }
}

async function injectWorker (inject, done) {
  const { url, body, $pubsub, $timeout, $attribute } = inject
  const payload = {
    body,
    attrs: $attribute
  }

  const beginTime = Date.now()
  this.$log.debug(`inject begin(${beginTime}): ${url}`)

  let hasErr = await this.$root[kBeanifyRunHooksAsync]('onBeforeInject', inject)
    .then(() => false)
    .catch(e => {
      this.$root[kBeanifyRunHooks]('onError', this, null, e)
      return true
    })

  if (hasErr) {
    return done()
  }

  inject[kInjectFlag] = true
  let pLike = null
  if ($pubsub) {
    hasErr = await requestSending
      .call(this, url, payload)
      .then(() => false)
      .catch(e => {
        this.$root[kBeanifyRunHooks]('onError', this, null, e)
        return true
      })
    pLike = inject.handler(null)
  } else {
    const reqOptions = {
      timeout: $timeout,
      max: 1
    }
    hasErr = await requestBlockSending
      .call(this, url, payload, reqOptions)
      .then(async reply => {
        const nattrs = reply.attrs || {}
        const oattrs = inject.$attribute

        const cattrs = Merge.recursive(nattrs, oattrs)
        inject[kInjectAttribute] = cattrs

        if (reply.err) {
          const { $errio } = this
          const e = $errio.fromObject(reply.err)
          pLike = inject.handler(e)
        } else {
          pLike = inject.handler(null, reply.data)
        }
        return false
      })
      .catch(e => {
        this.$root[kBeanifyRunHooks]('onError', this, null, e)
        return true
      })
  }

  if (pLike && typeof pLike.then === 'function') {
    pLike.finally(() => {
      inject[kInjectFlag] = false
    })
  } else {
    inject[kInjectFlag] = false
  }

  if (hasErr) {
    return done()
  }

  await this.$root[kBeanifyRunHooksAsync]('onAfterInject', inject).catch(e => {
    this.$root[kBeanifyRunHooks]('onError', this, null, e)
  })

  const endTime = Date.now()
  this.$log.debug(`inject finish(${endTime}): ${url}`)
  this.$log.info(`inject duration(${(endTime - beginTime) / 1000}ms): ${url}`)

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
    return this.$root[kBeanifyRunHooks]('onError', this, null, e)
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
    return this.$root[kBeanifyRunHooks]('onError', this, null, e)
  }

  if (isArrow(route.handler)) {
    const e = new RouteOptionsError(
      `handler for ${route.url} route not allow arrow function`
    )
    return this.$root[kBeanifyRunHooks]('onError', this, null, e)
  }

  for (const hk of routeHooks) {
    if (hk in route) {
      if (typeof route[hk] !== 'function') {
        route[hk] = noop
        break
      }

      if (isArrow(route[hk])) {
        const e = new HookCallbackError()
        return this.$root[kBeanifyRunHooks]('onError', this, null, e)
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
    this.$root[kBeanifyRunHooks]('onError', this, null, e)
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
    this.$root[kBeanifyRunHooks]('onError', this, null, e)
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
        this.$root[kBeanifyRunHooks]('onError', this, null, e)
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
  addInject
}
