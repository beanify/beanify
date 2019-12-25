'use strict'

const beanifyPlugin = require('beanify-plugin')

const AJV = require('ajv')
const FastQ = require('fastq')
const Errio = require('errio')
// const { Qlobber } = require('qlobber')

const errors = require('../errors')
const Util = require('../util')
const NATS = require('nats')

const defaultRouteOptionsSchema = {
  type: 'object',
  default: {},
  required: ['url'],
  properties: {
    url: {
      type: 'string'
    },
    $pubsub: {
      type: 'boolean',
      default: false
    },
    $max: {
      type: 'integer',
      minimum: 1
    },
    $timeout: {
      type: 'number',
      default: 2000
    }
  }
}

const defaultInjectOptionsSchema = {
  type: 'object',
  default: {},
  required: ['url'],
  properties: {
    url: {
      type: 'string'
    },
    body: {
      type: ['object', 'string', 'null']
    },
    $pubsub: {
      type: 'boolean',
      default: false
    },
    $max: {
      type: 'integer',
      minimum: 1
    },
    $expected: {
      type: 'integer',
      minimum: 1
    },
    $timeout: {
      type: 'number',
      default: 2000
    }
  }

}

class RouteContext {
  constructor(opts, instance) {
    this._opts = opts
    this._sid = -1
    this.$instance = instance
  }

  get $options() {
    return this._opts
  }

  registerService(done) {
    const { $transport: nats, $chain, $log } = this.$instance

    $chain.RunHook('onRoute', { route: this, log: $log }, (err) => {
      const {
        $pubsub,
        $max,
        $timeout,
        url
      } = this.$options

      if (this._checkNoError(err)) {
        const queue = `queue.${url}`

        if ($pubsub) {
          this._sid = nats.subscribe(url, {
            max: $max
          }, this._doRequest.bind(this))
        } else {
          this._sid = nats.subscribe(url, {
            queue,
            max: $max
          }, this._doRequest.bind(this))
        }

        nats.flush(() => {
          if ($timeout > 0 && tmrId !== null) {
            clearTimeout(tmrId)
            tmrId = null
          }
          done && done(null, true)
        })
        let tmrId
        if ($timeout > 0) {
          tmrId = setTimeout(() => {
            const _done = done
            tmrId = null
            done = null
            _done(null, false)
          }, $timeout)
        }
      } else {
        done(err)
      }
    })
  }

  _doRequest(natsRequest, natsReplyTo, topicUrl) {
    const { $chain, $log: log } = this.$instance

    natsRequest.fromUrl = topicUrl

    const context = Object.create(this)
    context.$channel = natsReplyTo
    context.$current = 0
    context.$closed = false
    context.$max = natsRequest.$max || 1

    $chain.RunHook('onRequest', { natsRequest, natsReplyTo, log }, (err) => {
      if (this._checkNoError(err)) {
        this._doBeforeHandler({ natsRequest, context })
      }
    })
  }

  _doBeforeHandler({ natsRequest, context }) {
    const { $chain, $log: log } = this.$instance

    $chain.RunHook('onBeforeHandler', { context, natsRequest, log }, (err) => {
      if (this._checkNoError(err)) {
        this._doHandler({ context, natsRequest })
      }
    })
  }

  _doHandler({ context, natsRequest }) {
    const { $chain, $log: log, $transport: nats } = this.$instance
    const { _handler } = this.$options

    const reqParams = {
      body: Object.assign({}, natsRequest.body),
      fromUrl: natsRequest.fromUrl
    }

    const repData = {
      items: []
    }

    context.write = (data) => {
      if (context.$max > 1 &&
        context.$current < context.$max &&
        context.$closed === false) {


        if (context.$channel && context.$closed === false) {
          nats.publish(context.$channel, {
            res: data,
            code: 200,
            $current: context.$current
          })
          repData.items.push(data)
        }

        context.$current++
        if (context.$current >= context.$max) {
          context.$closed = true
          this._doAfterHandler({ context, req: reqParams, res: repData })
        }
      }
    }

    context.error = (err) => {
      if (context.$channel && context.$closed === false) {
        nats.publish(context.$channel, {
          res: Errio.stringify(err),
          code: 404
        })
      }

      context.$closed = true
    }

    $chain.RunHook('onHandler', { context, req: reqParams, log }, (err) => {
      if (this._checkNoError(err)) {
        _handler.call(context, reqParams, (err, data) => {
          if (context.$closed === false && context.$max === 1) {
            if (err) {
              context.error(err)
            } else {
              this._doAfterHandler({ context, req: reqParams, res: data })
            }
          }
        })
      }
    })
  }

  _doAfterHandler({ context, req, res }) {
    const { $chain, $log: log } = this.$instance
    $chain.RunHook('onAfterHandler', { context, req, res, log }, (err) => {
      if (context.$max === 1) {
        if (this._checkNoError(err)) {
          this._doResponse({
            context,
            res
          })
        }
      }
    })
  }

  _doResponse({ context, res, code }) {
    const { $transport: nats, $chain, $log: log } = this.$instance

    const natsResponse = {
    }

    if (context.$channel) {
      $chain.RunHook('onResponse', { context, natsResponse, log }, (err) => {
        if (this._checkNoError(err)) {
          natsResponse.res = res
          natsResponse.code = 200
          nats.publish(context.$channel, natsResponse)
        }
      })
    }
  }

  _checkNoError(err) {
    const { $chain, $log } = this.$instance
    const { url } = this.$options

    const isNoErr = Util.checkNoError($chain, err)
    if (!isNoErr) {
      $log.error({ err, service: url })
    }
    return isNoErr
  }
}

class InjectContext {
  constructor(instance) {
    this.$instance = instance
  }

  get $options() {
    return this._opts
  }

  inject(opts, onResponsed) {
    const ajv = new AJV({ useDefaults: true })

    opts = Object.assign({}, opts)
    ajv.compile(defaultInjectOptionsSchema)(opts)

    let err = null; let result = null
    if (ajv.validate(defaultInjectOptionsSchema, opts) === false) {
      err = new errors.BeanifyError(ajv.errorsText(ajv.errors))
      err.message = `injectOptions ${err.message}`
    }

    const context = Object.create(this)
    context._parent = this
    context._excute = null

    if (onResponsed) {
      context._excute = onResponsed.bind(context)
      result = this
    } else {
      result = new Promise((resolve, reject) => {
        const _onResponsed = function (err, res) {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        }
        context._excute = _onResponsed.bind(context)
      })
    }

    if (err) {
      context._excute(err)
    } else {
      this._doBeforeInject({ injectOptions: opts, context })
    }

    return result
  }

  _doBeforeInject({ injectOptions, context }) {
    const ajv = new AJV({
      removeAdditional: 'all',
      useDefaults: true
    })

    const { $chain, $log: log } = this.$instance

    const payload = Object.assign({}, injectOptions)
    ajv.compile(defaultInjectOptionsSchema)(payload) //

    $chain.RunHook('onBeforeInject', { context, options: injectOptions, log }, (err) => {
      if (this._checkNoError(err)) {
        this._opts = injectOptions
        this._doInject({ context, payload })
      }
    })
  }

  _doInject({ context, payload }) {
    const { $chain, $log: log, $transport: nats } = this.$instance

    $chain.RunHook('onInject', { context, natsRequest: payload, log }, (err) => {
      if (this._checkNoError(err)) {
        const url = payload.url; delete payload.url
        const pubsub = payload.$pubsub; delete payload.$pubsub
        const max = payload.$max; delete payload.$max
        const expected = payload.$expected; delete payload.$expected
        const timeout = payload.$timeout; delete payload.$timeout

        const replys = {
          items: []
        }

        if (pubsub === true) {
          nats.publish(url, payload, (err) => {
            context._excute(err)
            this._doAfterInject({ err, context })
          })
        } else {
          const reqOpts = {
            timeout,
            max: 1
          }

          if (max || expected > 0) {
            reqOpts.max = expected || max
          }

          if (reqOpts.max > 1) {
            payload.$max = reqOpts.max
          }

          context.close = () => {
            nats.unsubscribe(context.$channel)
          }

          context.$channel = nats.request(url, payload, reqOpts, (reply) => {
            if (reply.code) {
              if (reply.code === 200) {
                context.$current = reply.$current 
                context._excute(null, reply.res)
                replys.items.push(reply.res)
              } else if (reply.code === 404) {
                context._excute(Errio.parse(reply.res))
                this._doAfterInject({ err: reply, context })
                if (reqOpts.max > 1) {
                  context.close()
                }
              } else if (reply.code === NATS.REQ_TIMEOUT) {
                context._excute(reply)
                this._doAfterInject({ err: reply, context })
              }
            }
          })

          if (expected > 0) {
            nats.timeout(context.$channel, timeout, expected, () => {
              const err = new errors.BeanifyError(`Inject timeout:${url}`)
              context._excute(err)
              this._doAfterInject({ err, context })
            })
          }

          nats.onUnsubscribe(context.$channel, () => {
            this._doAfterInject({ replys, context })
          })
        }
      }
    })
  }

  _doAfterInject({ err, context, replys }) {
    const { $chain, $log: log } = this.$instance
    replys = replys || {}
    $chain.RunHook('onAfterInject', { context, error: err, replys: replys.items, log }, (err) => {
      replys.items = []
      this._checkNoError(err)
    })
  }

  _checkNoError(err) {
    const { $chain, $log } = this.$instance
    const isNoErr = Util.checkNoError($chain, err)
    if (!isNoErr) {
      $log.error(err)
    }
    return isNoErr
  }
}

class Router {
  constructor({ beanify, opts, done }) {
    this._opts = Object.assign({}, opts)
    this._parent = beanify
    this._self = opts.main

    this._injectContext = new InjectContext(beanify)
    // this._matcher = new Qlobber({
    //     separator: '.',
    //     wildcard_one: '*',
    //     wildcard_some: '>'
    // })
    const { $avvio } = beanify

    this._routeQ = FastQ(this, (route, done) => {
      route.registerService((err, isOk) => {
        if (isOk === false) {
          this._routeQ.push(route)
        }
        done(err)
      })
    }, 1)
    this._routeQ.drain = () => {
      $avvio._readyQ.resume()
    }
    this._routeQ.pause()

    this._injectQ = FastQ(this, ({ opts, onResponsed }, done) => {
      this._injectContext.inject(opts, onResponsed)
      done()
    }, 1)
    this._injectQ.pause()

    $avvio._readyQ.unshift(() => {
      $avvio._readyQ.pause()
      this._routeQ.resume()
    })

    $avvio.on('start', () => {
      this._injectQ.resume()
    })

    setImmediate(done)
  }

  // get $matcher() {
  //     return this._matcher;
  // }

  route(opts, onRequest) {
    const currentInstance = this._self._current
    if (!currentInstance || typeof onRequest !== 'function') {
      return this._parent
    }

    const { $avvio } = this._parent
    const ajv = new AJV({ useDefaults: true })

    opts = Object.assign({}, opts)
    ajv.compile(defaultRouteOptionsSchema)(opts)

    if (ajv.validate(defaultRouteOptionsSchema, opts) === false) {
      const err = new errors.BeanifyError(ajv.errorsText(ajv.errors))
      err.message = `routeOptions ${err.message}`
      $avvio._error = err
      // throw error on avvio
      return this._parent
    }

    const prefix = currentInstance[beanifyPlugin.pluginPrefix]
    if (prefix !== '') {
      opts.url = `${prefix}.${opts.url}`
    }

    const service = new RouteContext({
      // url: opts.url,
      ...opts,
      _handler: onRequest
    }, this._parent)

    // const matchs = this._matcher.match(opts.url);
    // this._matcher.add(opts.url, service);

    // if (matchs.length == 0) {
    this._routeQ.push(service)
    // }

    return this._parent
  }

  inject(opts, onResponsed) {
    if (onResponsed) {
      this._injectQ.push({ opts, onResponsed })
      return this._parent
    } else {
      const evaluateResult = new Promise((resolve, reject) => {
        const _onResponsed = (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        }
        this._injectQ.push({ opts, onResponsed: _onResponsed })
      })
      return evaluateResult
    }
  }
}

module.exports = beanifyPlugin((beanify, opts, done) => {
  const router = new Router({ beanify, opts, done })

  beanify.decorate('$router', router)
  beanify.decorate('route', router.route.bind(router))
  beanify.decorate('inject', router.inject.bind(router))
}, {
  name: 'beanify-router',
  scoped: false
})
