const Beanify = require('./index')
const beanify = Beanify({})

beanify
  .route({
    url: 'math.:action',
    handler (req, rep) {
      console.log(req.params)
      rep.send(req.params) // { action: 'sub' } { action: 'add' }
    }
  })
  .ready(async e => {
    console.log(e && e.message)
    beanify.print()
    await beanify.inject({
      url: 'math.sub'
    })
    await beanify.inject({
      url: 'math.add'
    })
  })
