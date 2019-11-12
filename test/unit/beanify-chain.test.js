const Beanify = require("../../index")
const helper = require("../helper")
const tap = require("tap")

const beanifyPlugin = require("beanify-plugin")

tap.test('beanify-chain types test', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.ready((err)=>{
        t.error(err,'check err')
        t.strictSame(b.$chain.$types,[
            'onClose', // beanify avvio
            'onRoute', // register route
            'onBeforeInject', 'onInject', 'onAfterInject', // process inject
            'onRequest', 'onBeforeHandler', 'onHandler', 'onAfterHandler', 'onResposed',//process request
            'onError', // request process error
        ],'check $chain event types')
        b.close()
    })
})

tap.test('beanify-chain.addHook test with unkonw type', (t) => {

    t.plan(1)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        try {
            beanify.addHook('onUnkonw', ()=>{

            })
            done()
        } catch (e) {
            done(e)
        }
    })).ready((err)=>{
        t.equal(err.message,'Chain type is unknown : onUnkonw')
        b.close()
    })
})

tap.test('beanify-chain.addHook test with array handlers', (t) => {

    t.plan(1)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        try {
            beanify.addHook('onClose',[()=>{},()=>{}])
            done()
        } catch (e) {
            done(e)
        }
    })).ready((err)=>{
        t.error(err,'check err')
        b.close()
    })
})

tap.test('beanify-chain test with onClose Hook', (t) => {

    t.plan(1)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        try {
            beanify.addHook('onClose', ()=>{

            })

            beanify.$chain.RunHook('onClose',{},()=>{})
            done()
        } catch (e) {
            done(e)
        }
    })).ready((err)=>{
        t.equal(err.message,'onClose Hook called by avvio',"check err")

        b.close()
    })
})

tap.test('beanify-chain.RunHook test with unkonw type', (t) => {

    t.plan(1)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        try {
            beanify.$chain.RunHook('onUnkonw',{},()=>{})
            done()
        } catch (e) {
            done(e)
        }
    })).ready((err)=>{
        t.equal(err.message,'Chain type is unknown : onUnkonw')
        b.close()
    })
})

tap.test('beanify-chain test with onInject error', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.addHook('onInject',()=>{
            throw new Error('onInject.error')
        })
        beanify.addHook('onError',({err})=>{
            t.equal(err.message,'onInject.error','check error message')
            b.close()
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.add',
            $pubsub:true,
            // max:15
        })
        
    })
})

tap.test('beanify-chain test with onBeforeInject error', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.addHook('onBeforeInject',()=>{
            throw new Error('onBeforeInject.error')
        })
        beanify.addHook('onError',({err})=>{
            t.equal(err.message,'onBeforeInject.error','check error message')
            b.close()
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.add',
            $pubsub:true,
            // max:15
        })
        
    })
})

tap.test('beanify-chain test with onAfterInject error', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.addHook('onAfterInject',()=>{
            throw new Error('onAfterInject.error')
        })
        beanify.addHook('onError',({err})=>{
            t.equal(err.message,'onAfterInject.error','check error message')
            b.close()
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.add',
            $pubsub:true,
            // max:15
        })
        
    })
})

tap.test('beanify-chain test with onRequest error', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url:'math.addtt',
        },(req,res)=>{
            res(null,1)
        })

        beanify.addHook('onRequest',()=>{
            throw new Error('onRequest.error')
        })
        beanify.addHook('onError',({err})=>{
            t.equal(err.message,'onRequest.error','check error message')
            b.close()
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.addtt',
            body:{
                a:12,
                b:34
            }
        },(err,res)=>{

        })
        
    })
})

tap.test('beanify-chain test with onBeforeHandler error', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url:'math.addtt',
        },(req,res)=>{
            res(null,1)
        })

        beanify.addHook('onBeforeHandler',()=>{
            throw new Error('onBeforeHandler.error')
        })
        beanify.addHook('onError',({err})=>{
            t.equal(err.message,'onBeforeHandler.error','check error message')
            b.close()
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.addtt',
            body:{
                a:12,
                b:34
            }
        },(err,res)=>{

        })
        
    })
})

tap.test('beanify-chain test with onHandler error', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url:'math.addtt',
        },(req,res)=>{
            res(null,1)
        })

        beanify.addHook('onHandler',()=>{
            throw new Error('onHandler.error')
        })
        beanify.addHook('onError',({err})=>{
            t.equal(err.message,'onHandler.error','check error message')
            b.close()
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.addtt',
            body:{
                a:12,
                b:34
            }
        },(err,res)=>{

        })
        
    })
})

tap.test('beanify-chain test with onAfterHandler error', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url:'math.addtt',
        },(req,res)=>{
            res(null,1)
        })

        beanify.addHook('onAfterHandler',()=>{
            throw new Error('onAfterHandler.error')
        })
        beanify.addHook('onError',({err})=>{
            t.equal(err.message,'onAfterHandler.error','check error message')
            b.close()
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.addtt',
            body:{
                a:12,
                b:34
            }
        },(err,res)=>{

        })
        
    })
})

tap.test('beanify-chain test with onAfterHandler error', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url:'math.addtt',
        },(req,res)=>{
            res(null,1)
            res(null,2)
        })

        beanify.addHook('onResposed',()=>{
            throw new Error('onResposed.error')
        })
        beanify.addHook('onError',({err})=>{
            t.equal(err.message,'onResposed.error','check error message')
            b.close()
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.addtt',
            body:{
                a:12,
                b:34
            }
        },(err,res)=>{

        })
        
    })
})

tap.test('beanify-chain test with onAfterHandler promise style', (t) => {

    t.plan(2)

    const b = new Beanify({
        nats: Object.assign({}, helper.nats)
    })

    b.register(beanifyPlugin((beanify, opts, done) => {
        beanify.route({
            url:'math.addtt',
        },(req,res)=>{
            res(null,req.body.a)
        })

        beanify.addHook('onAfterHandler',({res})=>{
            return new Promise((resolve,reject)=>{
                if(res<13){
                    resolve()
                }else{
                    reject('promise.err')
                }
            })
        })
        beanify.addHook('onError',({err})=>{
            
            t.equal(err,'promise.err','check error message')
        })
        done()
    })).ready((err)=>{
        t.error(err,'check err')
        b.inject({
            url:'math.addtt',
            body:{
                a:12,
                b:34
            }
        },(err,res)=>{
            
        })
        
        b.inject({
            url:'math.addtt',
            body:{
                a:14,
                b:34
            }
        },(err,res)=>{

        })

        setTimeout(()=>{
            b.close()
        },2000)
    })
})