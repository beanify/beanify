const { inject } = require("async")


module.exports = (beanify, opts, done) => {

  beanify.addHook('onBeforeInject', (inject) => {
    const { $req } = inject

    if (inject.$pubsub == true) {
      return
    }

    $req.$trace = $req.$trace || {}
    $req.$trace.beforeInject = Date.now()
    inject.$trace = $req.$trace
  })

  beanify.addHook('onInject', (inject) => {
    const { $req } = inject

    if (inject.$pubsub == true) {
      return
    }

    $req.$trace = $req.$trace || {}
    $req.$trace.inject = Date.now()
    inject.$trace = $req.$trace
  })

  beanify.addHook('onAfterInject', (inject) => {
    const { $req, $res } = inject

    if (inject.$pubsub == true) {
      return
    }

    inject.$trace = $res.$trace || {}
    inject.$trace.afterInject = Date.now()

    $req.$trace = {}
    $res.$trace = {}
  })

  beanify.addHook('onBeforeHandler', (route) => {
    const { $req } = route

    if (route.$pubsub == true) {
      return
    }

    $req.$trace = $req.$trace || {}
    $req.$trace.beforeHandler = Date.now()
    route.$trace = $req.$trace
  })

  beanify.addHook('onHandler', (route) => {
    const { $req } = route

    if (route.$pubsub == true) {
      return
    }

    $req.$trace = $req.$trace || {}
    $req.$trace.handler = Date.now()
    route.$trace = $req.$trace
  })

  beanify.addHook('onAfterHandler', (route) => {
    const { $req, $res } = route
    if (route.$pubsub == true) {
      return
    }

    $req.$trace = $req.$trace || {}
    $req.$trace.afterHandler = Date.now()
    $res.$trace = $req.$trace
    route.$trace = $req.$trace
  })

  done()
}