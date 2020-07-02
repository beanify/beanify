const defaults = require("../default");
const beanifyPlugin = require("beanify-plugin")
const FastQ = require("fastq");
const errors = require("../errors")
const asyncs = require("async");

module.exports = (instance, opts, done) => {

  const { $avvio, $nats } = instance
  const globalHooks = {
    onRoute: [],

    onBeforeInject: [],
    onInject: [],
    onAfterInject: [],

    onBeforeHandler: [],
    onHandler: [],
    onAfterHandler:[],

    onError: []
  }

  const _routeQ = FastQ(instance, function (route, next) {
    onRouteCaller(route)
      .then(() => {
        const {
          $pubsub,
          $timeout,
          url
        } = route

        const queueTopic = `queue.${url}`

        if ($pubsub) {
          route.$sid = $nats.subscribe(url, {

          }, onRequestCaller.bind(this, route))
        } else {
          route.$sid = $nats.subscribe(url, {
            queue: queueTopic
          }, onRequestCaller.bind(this, route))
        }

        let tmrId = null
        $nats.flush(() => {
          if ($timeout > 0 && tmrId !== null) {
            clearTimeout(tmrId)
            tmrId = null
          }
          this.$log.debug(`register route:${url}`)
          next()
        })
        if ($timeout > 0) {
          tmrId = setTimeout(() => {
            tmrId = null
            this.$log.info(`register route timeout: ${url} `)
            _routeQ.push(route)
            next()
          }, $timeout)
        }
      })
      .catch((err) => {
        onErrorHookCaller(err, route.onError, () => {
          next(err)
        })
      })
  }, 1)

  _routeQ.pause()
  _routeQ.drain = () => {
    $avvio._readyQ.resume()
  }

  const _injectQ = FastQ(instance, function (inject, next) {
    onBeforeInjectCaller(inject)
      .then(async () => {
        await onInjectCaller(inject)

        const {
          url,
          $pubsub,
          $timeout
        } = inject

        const {
          $nats
        } = instance

        if ($pubsub) {
          await natsPublish.bind($nats)(url, inject.$req)
        } else {
          const reqOptions = {
            timeout: $timeout,
            max: 1
          }
          _result = await natsRequest.bind($nats)(url, inject.$req, reqOptions)

          inject.handler(null,_result.res)
          inject.$res=_result
        }

        await onAfterInjectCaller(inject)

        next()
      }).catch((err) => {
        onErrorHookCaller(err, inject.onError, () => { })
        inject.handler(err)
        next()
      })
  }, 1)
  _injectQ.pause()

  $avvio._readyQ.unshift(() => {
    $avvio._readyQ.pause()
    _routeQ.resume()
  })

  $avvio.on('start', () => {
    _injectQ.resume()
  })

  function routeCaller(options, onRequest) {

    const beanify = this.$root._current;

    if (!beanify) {
      //beanify is ready;not support add route
      return instance
    }

    if (typeof options.handler != 'function' && typeof onRequest != 'function') {
      //not handler function;not add route
      return instance
    }

    if (typeof options.handler != 'function') {
      options.handler = onRequest
    }

    options = defaults.routeOptions(options)

    const validateError = defaults.routeValidate(options)

    if (validateError) {
      // throw error on avvio
      $avvio._error = validateError
      return instance;
    }

    const partPrefix = beanify[beanifyPlugin.pluginPrefix]

    if (partPrefix !== '') {
      options.url = `${partPrefix}.${options.url}`
    }

    const globalPrefix = opts.prefix || ''

    if (globalPrefix !== '' && options.$useGlobalPrefix !== false) {
      options.url = `${globalPrefix}.${options.url}`
    }

    _routeQ.push(options)

    return this
  }

  function injectCaller(options, onResponse) {
    options = defaults.injectOptions(options)

    const validateError = defaults.injectValidate(options)

    if (!validateError) {
      const globalPrefix = opts.prefix || ''

      if (globalPrefix !== '' && options.$useGlobalPrefix !== false) {
        options.url = `${globalPrefix}.${options.url}`
      }
    }

    const inject = Object.create(options)
    inject.$req = {
      body: options.body
    }
    inject.$parent = options
    inject.$log = instance.$log
    inject.inject=instance.inject
    let returned = null
    if (onResponse) {
      inject.handler = onResponse.bind(inject)
      returned = this
    } else {
      returned = new Promise((resolve, reject) => {
        const _onResponse = function (err, res) {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        }

        inject.handler = _onResponse.bind(inject)
      })
    }

    if (validateError) {
      inject.handler(validateError)
    } else {
      _injectQ.push(inject)
    }
    return returned;
  }

  function addHookCaller(hookName, callbacks) {

    if (!Array.isArray(callbacks)) {
      callbacks = [callbacks]
    }

    if (hookName == 'onClose') {
      for (onCloseCb of callbacks) {
        this.onClose(onCloseCb)
      }

      return this
    }

    if (!Array.isArray(globalHooks[hookName])) {
      $avvio._error = new errors.BeanifyError(`Hook type is unknown : ${hookName}`)
      return this
    }

    for (hookCb of callbacks) {
      globalHooks[hookName].push(hookCb)
    }

    return this
  }

  function onRouteCaller(route) {
    return new Promise((resolve, reject) => {
      hooks = [...globalHooks['onRoute']]
      if (typeof route.onRoute === 'function') {
        hooks.push(route.onRoute)
      }

      runHooksCaller(hooks, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }, route)
    })
  }

  function onRequestCaller(route, req, replyTo, topic, sid) {

    const { $nats } = instance
    const request = Object.create(route)


    request.$req = {
      ...req,
      fromUrl: topic
    }
    request.$res = {

    }

    request.$replyTo = replyTo || ''
    const natsError=(err)=>{
      if (request.$pubsub == false && request.$replyTo != '') {
        $nats.publish(request.$replyTo, {
          err: instance.$errio.toObject(err)
        })
      }
    }
    const natsResponse=(payload)=>{
      if (request.$pubsub == false && request.$replyTo != '') {
        $nats.publish(request.$replyTo, payload)
      }
    }

    onBeforeHandlerCaller(request)
      .then(async () => {
        await onHandlerCaller(request)

        let sent=false
        const _sentCallback = (err, res) => {
          if(sent){
            return
          }
          sent=true
          
          if(err!=null){
            natsError(err)
            return
          }
          
          request.$res={
            res
          }

          onAfterHandlerCaller(request)
            .then(()=>{
              natsResponse(request.$res)
            })
            .catch((err)=>{
              onErrorHookCaller(err, request.onError, () => { })
              natsError(err)
            })
        }

        const _handler = request.handler.bind(instance.$root)
        const _result = _handler(request.$req,_sentCallback)
        if(_result&&typeof _result.then === 'function'){
          await _result
              .then((res)=>{
                _sentCallback(null,res)
              })
              .catch((err)=>{
                _sentCallback(err)
              })
        }

      })
      .catch((err) => {
        onErrorHookCaller(err, request.onError, () => { })
        natsError(err)
      })
  }

  function onErrorHookCaller(err, childHooks, done) {
    hooks = [...globalHooks['onError']]

    if (!Array.isArray(childHooks)) {
      childHooks = [childHooks]
    }

    for (func of childHooks) {
      if (typeof func === 'function') {
        hooks.push(func)
      }
    }

    instance.$log.error(err)
    runHooksCaller(hooks, done, err)
  }

  function onBeforeInjectCaller(inject) {
    return new Promise((resolve, reject) => {
      const hooks = [...globalHooks['onBeforeInject']]
      if (typeof inject.onBeforeInject === 'function') {
        hooks.push(inject.onBeforeInject)
      }

      runHooksCaller(hooks, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }, inject)
    })
  }

  function onInjectCaller(inject) {
    return new Promise((resolve, reject) => {
      const hooks = [...globalHooks['onInject']]
      if (typeof inject.onInject === 'function') {
        hooks.push(inject.onInject)
      }

      runHooksCaller(hooks, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }, inject)
    })
  }

  function onAfterInjectCaller(inject) {
    return new Promise((resolve, reject) => {
      const hooks = [...globalHooks['onAfterInject']]
      if (typeof inject.onAfterInject === 'function') {
        hooks.push(inject.onAfterInject)
      }

      runHooksCaller(hooks, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }, inject)
    })
  }

  function onBeforeHandlerCaller(request) {
    return new Promise((resolve, reject) => {
      const hooks = [...globalHooks['onBeforeHandler']]
      if (typeof request.onBeforeHandler === 'function') {
        hooks.push(request.onBeforeHandler)
      }

      runHooksCaller(hooks, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }, request)
    })
  }

  function onHandlerCaller(request) {
    return new Promise((resolve, reject) => {
      const hooks = [...globalHooks['onHandler']]
      if (typeof request.onHandler === 'function') {
        hooks.push(request.onHandler)
      }

      runHooksCaller(hooks, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }, request)
    })
  }

  function onAfterHandlerCaller(request){
    return new Promise((resolve, reject) => {
      const hooks = [...globalHooks['onAfterHandler']]
      if (typeof request.onAfterHandler === 'function') {
        hooks.push(request.onAfterHandler)
      }

      runHooksCaller(hooks, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }, request)
    })
  }

  function runHooksCaller(hooks, callback, ...args) {
    asyncs.series(hooks.map((hk) => {
      return (next) => {
        try {
          pms = hk.bind(instance.$root, ...args)()
          if (pms && typeof pms.then === 'function') {
            pms.then(next).catch(next)
          } else {
            process.nextTick(next)
          }
        } catch (err) {
          process.nextTick(next, err)
        }
      }
    }), callback)
  }

  function natsPublish(url, payload) {
    return new Promise((resolve, reject) => {
      this.publish(url, payload, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  function natsRequest(url, payload, reqOptions) {
    return new Promise((resolve, reject) => {
      const inbox = this.request(url, payload, reqOptions, (reply) => {
        if (reply.err !== undefined) {
          const err = instance.$errio.fromObject(reply.err)
          reject(err)
        } else {
          resolve(reply)
        }
      })

      this.timeout(inbox, reqOptions.timeout, 1, () => {
        reject(new errors.TimeoutError(`inject timeout:${url}`))
      })

    })
  }

  instance.decorate('route', routeCaller.bind(instance.$root))
  instance.decorate('addHook', addHookCaller.bind(instance.$root))
  instance.decorate('inject', injectCaller.bind(instance.$root))
  done()
}