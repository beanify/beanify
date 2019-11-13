'use strict'

const Beanify = require("../../index")
const beanifyPlugin = require("beanify-plugin")
const helper = require("../helper")
const tap = require("tap")

tap.test('beanify-router.route options test with no url error', (t) => {
    t.plan(1)

    const b1 = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    b1.register(beanifyPlugin((instance, opts, done) => {
        instance.route({
        }, () => {
        })
        done()
    })).ready((err) => {
        t.equal(err.message, "routeOptions data should have required property 'url'", 'check err.message');
        b1.close()
    })
})

tap.test('beanify-router.route onRequest test with onRequest no function', (t) => {
    t.plan(1)

    const b1 = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    b1.register(beanifyPlugin((instance, opts, done) => {
        instance.route({
            url: 'math.add'
        }, 'onRequest')
        done()
    })).ready((err) => {
        t.error(err);
        // t.equal(b1.$router.$matcher.match('math.add').length, 0, 'check $route.$matcher.length==0')
        b1.close()
    })
})

tap.test('beanify-router.route options.prefix test ', (t) => {
    t.plan(1)

    const b1 = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    b1.register(beanifyPlugin((instance, opts, done) => {
        instance.route({
            url: 'math.add'
        }, () => {

        })
        done()
    }, {
        prefix: 'v1'
    })).register(beanifyPlugin((instance, opts, done) => {
        instance.route({
            url: 'v1.math.add'
        }, () => {

        })
        done()
    })).ready((err) => {
        t.error(err);
        // t.equal(b1.$router.$matcher.match('v1.math.add').length, 2, 'check $route.$matcher.length==1')
        b1.close()
    })
})

tap.test('beanify-router.route test with $timeout', (t) => {
    t.plan(1)

    const b1 = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    b1.register(beanifyPlugin((instance, opts, done) => {
        instance.route({
            url: 'math.add',
            $timeout: 1
        }, () => {

        })
        done()
    })).ready((err) => {
        t.error(err);
        b1.close()
    })
})

tap.test('beanify-router "onRoute" hook test', (t) => {

    t.plan(4)

    const beanify = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    beanify.register(beanifyPlugin((instance, opts, done) => {
        instance.addHook('onRoute', ({ route, log }, done) => {
            t.equal(route.$options.url, 'v1.math.add', "check route.$url")
            t.equal(route.$options.$pubsub, true, "check route.$pubsub")
            t.equal(route.$options.$max, 11, "check route.$max")
            done()
            beanify.close()
        })
        done()
    })).register(beanifyPlugin((instance, opts, done) => {
        instance.route({
            url: 'math.add',
            $pubsub: true,
            $timeout: 0,
            $max: 11,
        }, () => {

        })
        done()
    }, {
        prefix: 'v1'
    })).ready((err) => {
        t.error(err)
    })
})

tap.test('beanify-router.inject test', (t) => {

    t.plan(7)

    const beanify = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    beanify.register(beanifyPlugin((instance, opts, done) => {

        instance.route({
            url: 'math.add',
        }, function (req, res) {
            
            const { body } = req;
            const result = body.a + body.b
            if (result < 5) {
                res(null, result)
            } else {
                res('a+b should < 5')
            }
        })

        done()

    })).register(beanifyPlugin((instance, opts, done) => {

        instance.inject({
            url: 'math.add',
            body: {
                a: 1,
                b: 2
            }
        }, function (err, res) {
            t.error(err, 'check inject.err')
            t.equal(res, 3, 'check math.add service')
            t.equal(this.$options.url,'math.add','check $options.url')
            this.inject({
                url: 'math.add',
                body: {
                    a: 2,
                    b: 2
                }
            }).then((res) => {
                t.equal(res, 4, 'check math.add service')
                this.inject({
                    url: 'math.add',
                    body: {
                        a: 3,
                        b: 6
                    }
                }).then((res) => {
                    t.ok(false, 'this will be not error', { err })
                }).catch((err) => {

                    this.inject({

                    }).then((res) => { })
                        .catch((err) => {
                            t.equal(err.message, "injectOptions data should have required property 'url'", "check defaultSchema with promise style")
                            beanify.close()
                        })

                    t.equal(err.code, 'REQ_TIMEOUT', 'check math.add service')

                })
            }).catch((err) => {
                t.ok(false, 'this will be not error', { err })
                beanify.close()
            })

            // this.


        })

        done()
    })).ready((err) => {
        t.error(err, 'check ready.err')
    })

})

tap.test('beanify-router.inject test with promise style', (t) => {

    t.plan(2)

    const beanify = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    beanify.register(beanifyPlugin((instance, opts, done) => {

        instance.route({
            url: 'math.add',
        }, function (req, res) {
            const { body } = req;
            res(null, body.a + body.b)
        })

        done()

    })).register(beanifyPlugin((instance, opts, done) => {

        instance.inject({
            url: 'math.add',
            body: {
                a: 1,
                b: 2
            }
        }).then((res) => {
            t.equal(res, 3, 'check math.add service')
            beanify.close()
        }).catch((err) => {
            t.error(err, 'check inject.err')
            beanify.close()
        })

        done()
    })).ready((err) => {
        t.error(err, 'check ready.err')
    })

})

tap.test('beanify-router.inject test with promise error', (t) => {

    t.plan(2)

    const beanify = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    beanify.register(beanifyPlugin((instance, opts, done) => {

        instance.route({
            url: 'math.add',
        }, function (req, res) {
            const { body } = req;
            res(new Error("test error message"), body.a + body.b)
        })

        done()

    })).register(beanifyPlugin((instance, opts, done) => {

        instance.inject({
            url: 'math.add',
            body: {
                a: 1,
                b: 2
            }
        }).then((res) => {
            t.ok(false, 'check inject.err will throw error')
            beanify.close()
        }).catch((err) => {
            t.equal(err.code, "REQ_TIMEOUT", 'check inject.err')
            beanify.close()
        })

        done()
    })).ready((err) => {
        t.error(err, 'check ready.err')
    })

})

tap.test('beanify-router.inject test with promise error 2', (t) => {

    t.plan(2)

    const beanify = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    beanify.register(beanifyPlugin((instance, opts, done) => {

        instance.route({
            url: 'math.add',
        }, function (req, res) {
            const { body } = req;
            res("test error message", body.a + body.b)
        })

        done()

    })).register(beanifyPlugin((instance, opts, done) => {

        instance.inject({
            url: 'math.add',
            body: {
                a: 1,
                b: 2
            }
        }).then((res) => {
            t.ok(false, 'check inject.err will throw error')
            beanify.close()
        }).catch((err) => {
            t.equal(err.code, 'REQ_TIMEOUT', 'check inject.err')
            beanify.close()
        })

        done()
    })).ready((err) => {
        t.error(err, 'check ready.err')
    })

})

tap.test('beanify-router.inject test with $timeout', (t) => {

    t.plan(2)

    const beanify = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    beanify.register(beanifyPlugin((instance, opts, done) => {

        instance.route({
            url: 'math.add',
        }, function (req, res) {
            const { body } = req;
            res(null, body.a + body.b)
        })

        done()

    })).register(beanifyPlugin((instance, opts, done) => {

        instance.inject({
            url: 'math.add',
            body: {
                a: 1,
                b: 2
            },
            $timeout: 1
        }, function (err, res) {
            t.equal(err.code, 'REQ_TIMEOUT', 'check inject.err')
            beanify.close()
        })

        done()
    })).ready((err) => {
        t.error(err, 'check ready.err')
    })

})

tap.test('beanify-router.inject test with defaultSchema check', (t) => {

    t.plan(2)

    const beanify = new Beanify({
        nats: Object.assign({}, helper.nats),
    })

    beanify.register(beanifyPlugin((instance, opts, done) => {

        instance.route({
            url: 'math.add',
        }, function (req, res) {
            const { body } = req;
            res(null, body.a + body.b)
        })

        done()

    })).register(beanifyPlugin((instance, opts, done) => {
        instance.inject({
            body: {
                a: 1,
                b: 2
            },
            $timeout: 1
        }, function (err, res) {
            t.equal(err.message, "injectOptions data should have required property 'url'", 'check ready.err')
            beanify.close()
        })
        done()
    })).ready((err) => {
        t.error(err)
        if (err) {
            beanify.close()
        }
    })

})

tap.test('beanify-router.inject test with $expected', (t) => {
    t.plan(5)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url: 'math.add'
        }, function ({ body }, res) {
            let return_count = 3;
            // console.log({ pipe: this.pipe, this: this })
            // this.pipe(return_count)
            function sendRes() {
                let result = body.a + return_count
                if (return_count > 0) {
                    this.write(result)
                    return_count--;
                    setTimeout(sendRes.bind(this), 500)
                }
            }
            // console.log({pipe:this.pipe,this:this})
            sendRes.bind(this)()
        })

        done()
    })).ready((err) => {
        t.error(err);
        let resArray = []
        b.inject({
            url: 'math.add',
            body: {
                a: 10
            },
            $expected: 3,
            $timeout: 15000
        }, function (err, res) {
            t.error(err)

            resArray.push(res)

            if (res == 11) {
                t.strictSame(resArray, [13, 12, 11], 'check resArray')
                b.close()
            }


        })
    })
})

tap.test('beanify-router.inject test with $expected timeout', (t) => {
    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url: 'math.add'
        }, function ({ body }, res) {

        })

        done()
    })).ready((err) => {
        t.error(err);
        b.inject({
            url: 'math.add',
            body: {
                a: 10
            },
            $expected: 3,
            $timeout: 1
        }, function (err, res) {
            t.equal(err.message,"Inject timeout:math.add",'check error message')
            b.close()
        })
    })
})

tap.test('beanify-router.inject test with $max timeout', (t) => {
    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url: 'math.add'
        }, function ({ body }, res) {

        })

        done()
    })).ready((err) => {
        t.error(err);
        b.inject({
            url: 'math.add',
            body: {
                a: 10
            },
            $max: 3,
            $timeout: 1
        }, function (err, res) {
            t.equal(err.code,"REQ_TIMEOUT",'check error message')
            b.close()
        })
    })
})

tap.test('beanify-router.inject test with $pubsub mode', (t) => {
    t.plan(3)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url: 'math.add'
        }, function ({ body }, res) {
            t.equal(body.a,10,'check body.a')
            if(body.a==10){
                b.close()
            }
        })

        done()
    })).ready((err) => {
        t.error(err);
        b.inject({
            url: 'math.add',
            body: {
                a: 10
            },
            $expected: 3,
            $timeout: 1,
            $pubsub:true
        },(err)=>{
            t.error(err)
        })
    })
})