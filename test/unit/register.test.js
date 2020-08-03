const Beanify = require('../../index')
const helper = require('../helper')

const beanifyPlugin = require('beanify-plugin')
const tap = require('tap')

tap.test('beanify.register $plugins test', (t) => {
  t.plan(2)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    name: 'plugin1'
  })).register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    name: 'plugin2'
  })).ready((err) => {
    t.error(err)
    t.strictSame(b.$plugins, ['beanify-logger', 'beanify-errio', 'beanify-chain', 'beanify-nats', 'beanify-router', 'plugin1', 'plugin2'], 'check loaded plugins')
    b.close()
  })
})

tap.test('beanify.register options test', (t) => {
  t.plan(3)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    t.equal(opts.from_meta, 'this option from plugin meta', 'check options from plugin meta')
    t.equal(opts.from_opts, 'this option from normal option', 'check options from normal option')
    done()
  }, {
    options: {
      from_meta: 'this option from plugin meta'
    }
  }), {
    from_opts: 'this option from normal option'
  })

  b.ready((err) => {
    t.error(err)
    b.close()
  })
})

tap.test('beanify.register prefix test', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    scoped: false,
    prefix: 'plugin1'
  })).register((beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    scoped: false,
    prefix: 'plugin2'
  }))).ready((err) => {
    t.equal(err.message, 'has prefix:plugin1 in this scoped,new prefix:plugin2', 'check err.message with scoped==false')
    b.close()
  })
})

tap.test('beanify.register beanify-plugin scope test', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register((beanify, opts, done) => {
    done()
  }).register((beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    scoped: false,
    prefix: 'plugin2'
  }))).ready((err) => {
    t.equal(err.message, 'Encapsulation error, need to encapsulate the plugin with beanify-plugin', 'check err.message')
    b.close()
  })
})

tap.test('beanify.register dependencies test', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    name: 'plugin1'
  })).register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    name: 'plugin2',
    dependencies: ['plugin1']
  })).ready((err) => {
    t.error(err, 'check err')
    b.close()
  })
})

tap.test('beanify.register decorators test', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    beanify.decorate('decoValue', 15)
    done()
  })).register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    decorators: ['decoValue']
  })).ready((err) => {
    t.error(err, 'check err')
    b.close()
  })
})

tap.test('beanify.register dependencies test with "dependencies not array" error', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    name: 'plugin1'
  })).register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    name: 'plugin2',
    dependencies: 'plugin1'
  })).ready((err) => {
    t.equal(err.message, 'Plugin dependencies must be an array of strings', 'check err.message')
    b.close()
  })
})

tap.test('beanify.register dependencies test with "dependency not registered" error', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    name: 'plugin1',
    dependencies: ['plugin2']
  })).register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    name: 'plugin2'
  })).ready((err) => {
    t.equal(err.message, "The dependency 'plugin2' is not registered", 'check err.message')
    b.close()
  })
})

tap.test('beanify.register decorators test with "decorators not array" error', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    done()
  })).register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    decorators: 'plugin1'
  })).ready((err) => {
    t.equal(err.message, 'Plugin decorators must be an array of strings', 'check err.message')
    b.close()
  })
})

tap.test('beanify.register decorators test with "decorator not registered" error', (t) => {
  t.plan(1)

  const b = new Beanify({
    nats: helper.nats
  })

  b.register(beanifyPlugin((beanify, opts, done) => {
    done()
  }, {
    decorators: ['plugin2']
  })).ready((err) => {
    t.equal(err.message, "The decorator dependency 'plugin2' is not registered", 'check err.message')
    b.close()
  })
})
