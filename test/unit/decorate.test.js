const Beanify = require('../../index')
const beanifyPlugin = require('beanify-plugin')
const helper = require('../helper')
const tap = require('tap')

tap.test('beanify.decorate sample test', (t) => {
  t.plan(5)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    beanify.decorate('decoValue', 15)
    beanify.decorate('decoFunc', (a, b) => { return a + b })

    done()
  }))

  b.ready((err) => {
    t.error(err)
    t.ok(b.hasDecorator('decoValue'), 'check decoValue exist')
    t.ok(b.hasDecorator('decoFunc'), 'check decoFunc exist')
    t.equal(b.decoValue, 15, 'check decoValue')
    t.equal(b.decoFunc(1, 2), 3, 'check decoFunc ')

    b.close()
  })
})

tap.test('beanify.decorate repeat decorate with same name', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    try {
      beanify.decorate('decoValue', 15)
      beanify.decorate('decoValue', (a, b) => { return a + b })
      done()
    } catch (e) {
      done(e)
    }
  }))

  b.ready((err) => {
    t.equal(err.message, 'Decoration has been already added', 'check err.message')

    b.close()
  })
})

tap.test('beanify.decorate dependencies test with missing member', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    try {
      beanify.decorate('decoValue', 15, ['decoFunc'])
      done()
    } catch (e) {
      done(e)
    }
  }))

  b.ready((err) => {
    t.equal(err.message, "Missing member dependency 'decoFunc'", 'check err.message')

    b.close()
  })
})

tap.test('beanify.decorate dependencies test', (t) => {
  t.plan(2)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    try {
      beanify.decorate('decoValue', 15)
      beanify.decorate('decoFunc', (a) => {
        return a + beanify.decoValue
      }, ['decoValue'])
      done()
    } catch (e) {
      done(e)
    }
  }))

  b.ready((err) => {
    t.error(err)
    t.equal(b.decoFunc(1), 16, 'check decoFunc worked')

    b.close()
  })
})
