const Beanify = require('../../index')
const helper = require('../helper')
const tap = require('tap')

tap.test('beanify-nats $options test', (t) => {
  t.plan(3)

  const b1 = new Beanify({
    nats: Object.assign({}, helper.nats)
  })

  b1.ready(() => {
    t.ok(b1.hasDecorator('$transport'), 'check $transport')
    t.strictSame(b1.$transport.$options, b1.$options.nats, 'check $transport.$options ')
    t.equal(b1.$transport.$connected, true, 'check $transport.$connected')

    b1.close()
  })
})

tap.test('beanify-nats auth test with NATS_PROTOCOL_ERR error', (t) => {
  t.plan(1)

  const opts = Object.assign({}, helper.nats)
  opts.user = '1234'
  const b1 = new Beanify({
    nats: opts
  })

  b1.ready((err) => {
    t.equal(err.code, 'NATS_PROTOCOL_ERR', 'check e.code')

    b1.close()
  })
})

tap.test('beanify-nats net test with NON_SECURE_CONN_REQ error', (t) => {
  t.plan(1)

  const opts = Object.assign({}, helper.nats)
  opts.tls = true
  const b1 = new Beanify({
    nats: opts
  })

  b1.ready((err) => {
    t.equal(err.code, 'NON_SECURE_CONN_REQ', 'check e.code')

    b1.close()
  })
})
