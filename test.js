
const Beanify = require('./index')
const beanifyPlugin = require('beanify-plugin')

const b = new Beanify(require("beanify-env-options")())

b.register(beanifyPlugin((beanify, opts, done) => {
  beanify.register(beanifyPlugin((b, o, done) => {
    beanify
      .route({
        url: 'math.add',
        dev: true
      }, function ({ body }, res) {
        res(null, body.a + body.b, body.a, body.b)
      })
      .route({
        url: 'math.sub'
      }, ({ body }, res) => {
        res(null, body.a - body.b)
      })

    done()
  }))
  done()
}))

b.ready(async function (err) {
  console.log({
    readyError: err
  })
  b.inject({
    url: 'math.add',
    body: {
      a: 10,
      b: 3
    }
    // $max:5
  }, function (err, res1, res2, res3) {
    console.log({
      res1,
      res2,
      res3,
      err,
      cur: this.$current
    })
  })

  // const finallyResult = await b
  //   .inject({
  //     url: 'math.add',
  //     body: {
  //       a: 2,
  //       b: 3
  //     }
  //     // $max: 5
  //   }).then((res) => {
  //     console.log({
  //       l1: res
  //     })
  //     return res
  //   }).then((arg) => {
  //     console.log({
  //       l2: arg
  //     })
  //     return arg - 4
  //   }).then(async (arg) => {
  //     console.log({
  //       l3: arg
  //     })
  //     const res = await this.inject({
  //       url: 'math.sub',
  //       body: {
  //         a: 100,
  //         b: arg
  //       }
  //     })
  //     return res
  //   }).catch((err) => {
  //     console.log({
  //       err1: err
  //     })
  //     return "999999"
  //   })

  // console.log({
  //   finallyResult
  // })

  // b
  //   .inject({
  //     url: 'math.add',
  //     body: {
  //       a: 2,
  //       b: 3
  //     },
  //     // $max: 5
  //   }, function (err, res) {
  //     console.log({
  //       res, err,
  //       self1: this
  //     })

  //     this.inject({
  //       url: 'math.sub',
  //       body: {
  //         a: 20,
  //         b: 2
  //       }
  //     }).then((res) => {
  //       return res
  //     }).then(async (subRes) => {
  //       console.log({
  //         subRes,
  //         self0: this
  //       })
  //       return await this.inject({
  //         url: 'math.add',
  //         body: {
  //           a: 3,
  //           b: 5
  //         }
  //       })
  //     }).then((addRes) => {
  //       console.log({
  //         addRes,
  //         self2: this
  //       })
  //     })
  // })
})
