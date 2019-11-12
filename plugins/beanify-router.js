'use strict'

const beanifyPlugin = require("beanify-plugin")

const AJV = require("ajv")
const FastQ = require("fastq")
// const { Qlobber } = require('qlobber')

const errors = require("../errors")
const Util = require("../util")
const NATS = require("nats")

const defaultRouteOptionsSchema = {
    type: 'object',
    default: {},
    required: ['url'],
    properties: {
        url: {
            type: 'string',
        },
        $pubsub: {
            type: 'boolean',
            default: false,
        },
        $max: {
            type: 'integer',
            minimum: 1
        },
        $timeout: {
            type: 'number',
            default: 2000
        }
    },
}

const defaultInjectOptionsSchema = {
    type: 'object',
    default: {},
    required: ['url'],
    properties: {
        url: {
            type: 'string',
        },
        body: {
            type: ['object', 'string', 'null'],
        },
        $pubsub: {
            type: 'boolean',
            default: false,
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
    },

}

class RouteContext {
    constructor(opts, { _transport, _chain, _log }) {
        this._opts = opts
        this._sid = -1;
        this._transport = _transport;
        this._chain = _chain;
        this._log = _log
    }

    get $options() {
        return this._opts
    }

    registerService(done) {
        const { _transport: nats } = this

        const {
            $pubsub,
            $max,
            $timeout,
            url
        } = this.$options

        // if (nats.$connected) {
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
            if ($timeout > 0) {
                clearTimeout(tmrId);
            }
            done && done(true)
        })
        let tmrId
        if ($timeout > 0) {
            tmrId = setTimeout(() => {
                const _done = done;
                done = null;
                _done(false)
            }, $timeout)
        }
        // } else {
        //     done(false);
        // }
    }

    _doRequest(natsRequest, natsReplyTo) {
        const { _transport, _chain, _log: log } = this
        const { url, _handler } = this.$options

        _chain.RunHook('onRequest', { natsRequest, natsReplyTo, log }, (err) => {
            if (this._checkNoError(err)) {
                const req = {}
                req.url = url
                req.request = natsRequest
                req.replyTo = natsReplyTo
                this._doBeforeHandler({ req })
            }
        })

    }

    _doBeforeHandler({ req }) {
        const { _transport, _chain, _log: log } = this
        const { url, _handler } = this.$options

        const context = Object.create(this);
        _chain.RunHook('onBeforeHandler', { context, natsRequest: req.request, log }, (err) => {
            if (this._checkNoError(err)) {
                this._doHandler({ context, req })
            }
        })

    }

    _doHandler({ context, req }) {
        const { _transport, _chain, _log: log } = this
        const { url, _handler } = this.$options
        context.write = (data) => {
            this._doResposed({ context, res: data, replyTo: req.replyTo })
        }

        const reqParams = {
            body: Object.assign({}, req.request.body)
        }
        let sent = false;
        _chain.RunHook('onHandler', { context, req: reqParams, log }, (err) => {
            if (this._checkNoError(err)) {
                const scopeExcute = _handler.bind(context)
                scopeExcute(reqParams, (err, res) => {
                    if (!sent) {
                        sent = true
                        if (this._checkNoError(err)) {
                            this._doAfterHandler({ context, req: reqParams, res, replyTo: req.replyTo })
                        }
                    }
                })
            }
        })
    }

    _doAfterHandler({ context, req, res, replyTo }) {
        const { _transport, _chain, _log: log } = this
        _chain.RunHook('onAfterHandler', { context, req, res, log }, (err) => {
            if (this._checkNoError(err)) {
                this._doResposed({ context, res, replyTo })
            }
        })
    }

    _doResposed({ context, res, replyTo }) {
        const { _transport, _chain, _log: log } = this

        const natsResponse = {
        }
        _chain.RunHook('onResposed', { context, natsResponse, log }, (err) => {
            if (this._checkNoError(err)) {
                natsResponse.payload = res;
                _transport.publish(replyTo, natsResponse)
            }
        })
    }

    _checkNoError(err) {
        const { _chain, _log } = this;
        const { url, _handler } = this.$options

        let isNoErr = Util.checkNoError(_chain, err)
        if (!isNoErr) {
            _log.error({ err, service: url })
        }
        return isNoErr;
    }
}

class InjectContext {

    constructor({ _transport, _chain, _log }) {
        this._transport = _transport;
        this._chain = _chain;
        this._log = _log;
    }

    inject(opts, onResponsed) {
        const ajv = new AJV({ useDefaults: true })

        opts = Object.assign({}, opts)
        ajv.compile(defaultInjectOptionsSchema)(opts)

        let err = null, result = null;
        if (ajv.validate(defaultInjectOptionsSchema, opts) === false) {
            err = new errors.BeanifyError(ajv.errorsText(ajv.errors))
            err.message = `injectOptions ${err.message}`
        }

        const context = Object.create(this)
        context._parent = this;
        context._excute = null;


        if (onResponsed) {
            context._excute = onResponsed.bind(context)
            result = this;
        } else {
            result = new Promise((resolve, reject) => {
                const _onResponsed = function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
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

        return result;
    }

    _doBeforeInject({ injectOptions, context }) {
        const ajv = new AJV({
            removeAdditional: 'all',
            useDefaults: true,
        })

        const { _chain, _log: log } = this;

        const payload = Object.assign({}, injectOptions)
        ajv.compile(defaultInjectOptionsSchema)(payload) // 

        _chain.RunHook('onBeforeInject', { context, options: injectOptions, log }, (err) => {
            if (this._checkNoError(err)) {
                this._doInject({ context, payload })
            }
        })
    }

    _doInject({ context, payload }) {
        const { _chain, _log: log, _transport } = this;

        _chain.RunHook('onInject', { context, natsRequest: payload, log }, (err) => {
            if (this._checkNoError(err)) {
                const url = payload.url; delete payload.url;
                const pubsub = payload.$pubsub; delete payload.$pubsub
                const max = payload.$max; delete payload.$max
                const expected = payload.$expected; delete payload.$expected
                const timeout = payload.$timeout; delete payload.$timeout

                const replys = {
                    items: []
                }

                if (pubsub === true) {
                    _transport.publish(url, payload, (err) => {
                        context._excute(err);
                        this._doAfterInject({ err, context })
                    })
                } else {
                    const reqOpts = {
                        timeout,
                        max: 1
                    }

                    if (max || expected > 0) {
                        reqOpts.max = expected || max;
                    }

                    const conf = _transport.request(url, payload, reqOpts, (reply) => {
                        if (reply.code && reply.code === NATS.REQ_TIMEOUT) {

                            this._checkNoError(reply)
                            context._excute(reply)
                            this._doAfterInject({ err: reply, context })
                        } else {
                            context._excute(null, reply.payload)
                            replys.items.push(reply)
                        }
                    })

                    if (expected > 0) {
                        _transport.timeout(conf.confId, timeout, expected, () => {
                            const err = new errors.BeanifyError(`Inject timeout:${url}`);
                            context._excute(err)
                            this._doAfterInject({ err, context })
                        })
                    }

                    _transport.on(conf.inbox, (sid) => {
                        this._doAfterInject({ replys, context })
                    })
                }
            }
        })
    }

    _doAfterInject({ err, context, replys }) {
        const { _chain, _log: log } = this;
        replys = replys || {}
        _chain.RunHook('onAfterInject', { context, error: err, replys: replys.items, log }, (err) => {
            replys.items = []
            this._checkNoError(err)
        })
    }

    _checkNoError(err) {
        const { _chain, _log } = this;
        let isNoErr = Util.checkNoError(_chain, err)
        if (!isNoErr) {
            _log.error(err)
        }
        return isNoErr;
    }

}

class Router {
    constructor({ beanify, opts, done }) {
        this._opts = Object.assign({}, opts);
        this._parent = beanify;
        this._self = opts.main;

        const { $avvio, $chain, $transport, $log } = beanify;

        this._injectContext = new InjectContext({
            _transport: $transport,
            _chain: $chain,
            _log: $log
        })
        // this._matcher = new Qlobber({
        //     separator: '.',
        //     wildcard_one: '*',
        //     wildcard_some: '>'
        // })

        this._routeQ = FastQ(this, (route, done) => {
            route.registerService((sendOk) => {
                if (sendOk) {
                    $chain.RunHook('onRoute', { route, log: $log }, done)
                } else {
                    this._routeQ.push(route)
                    done()
                }
            })
        }, 1)
        this._routeQ.drain = () => {
            $avvio._readyQ.resume();
        }
        this._routeQ.pause();

        this._injectQ = FastQ(this, ({ opts, onResponsed }, done) => {
            this._injectContext.inject(opts, onResponsed)
            done()
        }, 1)
        this._injectQ.pause();

        $avvio._readyQ.unshift(() => {
            $avvio._readyQ.pause();
            this._routeQ.resume();
        })

        $avvio.on('start', () => {
            this._injectQ.resume();
        })

        setImmediate(done)
    }

    // get $matcher() {
    //     return this._matcher;
    // }

    route(opts, onRequest) {

        const currentInstance = this._self._current
        if (!currentInstance || typeof onRequest !== 'function') {
            return this._parent;
        }

        const { $transport, $avvio, $chain, $log } = this._parent;
        const ajv = new AJV({ useDefaults: true })

        opts = Object.assign({}, opts)
        ajv.compile(defaultRouteOptionsSchema)(opts)

        if (ajv.validate(defaultRouteOptionsSchema, opts) === false) {
            const err = new errors.BeanifyError(ajv.errorsText(ajv.errors))
            err.message = `routeOptions ${err.message}`
            $avvio._error = err
            // throw error on avvio
            return this._parent;
        }

        const prefix = currentInstance[beanifyPlugin.pluginPrefix]
        if (prefix != '') {
            opts.url = `${prefix}.${opts.url}`
        }

        const service = new RouteContext({
            // url: opts.url,
            ...opts,
            _handler: onRequest,
        }, {
            _transport: $transport,
            _chain: $chain,
            _log: $log
        })

        // const matchs = this._matcher.match(opts.url);
        // this._matcher.add(opts.url, service);

        // if (matchs.length == 0) {
        this._routeQ.push(service);
        // }

        return this._parent;
    }

    inject(opts, onResponsed) {
        if (onResponsed) {
            this._injectQ.push({ opts, onResponsed })
            return this._parent;
        } else {
            const evaluateResult = new Promise((resolve, reject) => {
                const _onResponsed = (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                }
                this._injectQ.push({ opts, onResponsed: _onResponsed })
            })
            return evaluateResult;
        }
    }

    // _sysOnInjectBuildInfo(context, done) {
    //     const { _opts, _parent, log } = context;

    //     const currentTime = Util.nowTime()

    //     context.$context = _opts.$context || _parent.$context;
    //     context.$delegate = _opts.$delegate || {}
    //     context.$meta = Object.assign(context.$meta, _opts.$meta)

    //     context.$trace = {
    //         spanId: _parent.$trace.spanId || Util.generateRandomId(),
    //         traceId: _parent.$trace.traceId || Util.generateRandomId(),
    //         parentSpanId: _parent.$trace.spanId,
    //         timestamp: currentTime,
    //         service: _opts.url,
    //     }

    //     // detect recursion 递归检测
    //     // 后续添加



    //     if (log.level === 'trace') {
    //         context.log = context.log.child({
    //             parentSpanId: context.$trace.parentSpanId,
    //             traceId: context.$trace.traceId,
    //             spanId: context.$trace.spanId
    //         })

    //         context.log.trace({ service: _opts.url }, 'Request started')
    //     } else {
    //         context.log.info({ service: _opts.url }, 'Request started')
    //     }

    //     const payload={
    //         body:Util.formatBody(_opts.body),
    //         meta:context.$meta,
    //         delegate:context.$delegate,
    //         trace:context.$trace,
    //     }

    //     context._payload=payload

    //     done()
    // }

}




module.exports = beanifyPlugin((beanify, opts, done) => {
    const router = new Router({ beanify, opts, done });

    beanify.decorate('$router', router)
    beanify.decorate('route', router.route.bind(router))
    beanify.decorate('inject', router.inject.bind(router))

}, {
    name: 'beanify-router',
    scoped: false
})