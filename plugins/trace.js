const { inject } = require("async")


module.exports = (beanify, opts, done) => {

  beanify.addHook('onBeforeInject', (inject) => {
    const { $req } = inject

    $req.$trace = $req.$trace || {}
    $req.$trace.beforeInject = Date.now()
  })

  beanify.addHook('onInject', (inject) => {
    const { $req } = inject

    $req.$trace = $req.$trace || {}
    $req.$trace.inject = Date.now()
  })

  beanify.addHook('onAfterInject', (inject) => {
    const { $req ,$res} = inject
    inject.$trace=$res.$trace||{}
    inject.$trace.afterInject = Date.now()

    $req.$trace={}
    $res.$trace={}
  })

  beanify.addHook('onBeforeHandler', (request) => {
    const { $req } = request
    $req.$trace = $req.$trace || {}
    $req.$trace.beforeHandler = Date.now()
  })

  beanify.addHook('onHandler', (request) => {
    const { $req } = request
    $req.$trace = $req.$trace || {}
    $req.$trace.handler = Date.now()
  })

  beanify.addHook('onAfterHandler', (request) => {
    const { $req,$res } = request
    $req.$trace = $req.$trace || {}
    $req.$trace.afterHandler = Date.now()

    $res.$trace=$req.$trace
  })

  done()
}