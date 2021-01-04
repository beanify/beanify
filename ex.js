const Beanify = require('./index')

const beanify = Beanify({})
// beanify.addHook('onError', function () {
//   console.log(this.$name)
// })

// beanify.addHook('onRoute', function (route) {})

beanify
  .register(async (ins, opts) => {
    ins.route({
      url: 'math.add',
      handler (req, rep) {
        rep.send(req.body)
        this.$attribute.val = req.body
        // this.$attribute.p1.v1 = 'pppppp'
        // throw new Error('message from handler')
      },
      onBeforeHandler (req, rep) {
        // console.log(this.$parent)
        this.$parent.a = 'asdadasd'
        // throw new Error('message from onBeforeHandler')
      },
      onAfterHandler (req, rep) {
        console.log(this.a)
        // throw new Error('message from onAfterHandler')
      }
    })
    ins.route({
      url: 'math.sub',
      handler (req, rep) {
        rep.send(req.body)
        this.$attribute.val = req.body
        // this.$attribute.p1.v1 = 'pppppp'
        // throw new Error('message from handler')
      },
      onBeforeHandler (req, rep) {
        // throw new Error('message from onBeforeHandler')
      },
      onAfterHandler (req, rep) {
        // throw new Error('message from onAfterHandler')
      }
    })
  })
  .ready(async () => {
    beanify.inject({
      url: 'math.add',
      $usePrefix: true,
      // attribute: { p1: { v1: 'ooo' } },
      context: { deep: 1 },
      body: { v1: 'opopopop' },
      async handler (e, data) {
        const d1 = await this.inject({
          url: 'math.add',
          $usePrefix: true,
          // context: { deep: 2 },
          body: { v1: 'dddddddddddd' }
        })
        const d2 = await this.inject({
          url: 'math.add',
          $usePrefix: true,
          // context: { deep: 2 },
          body: { v1: '2222222222' }
        })
        console.log({
          d1,
          d2
        })
        beanify.print()
      }
      // onBeforeInject () {},
      // onAfterInject () {}
    })
  })

// const kBeanifyPluginMeta = Symbol.for('beanify.plugin.meta')
// function beanifyPlugin (fn, opts) {
//   fn[kBeanifyPluginMeta] = opts
//   return fn
// }

// beanify
//   .route({
//     url: 'math.add.v0',
//     handler () {}
//   })
//   .register(
//     beanifyPlugin(
//       (i1, opts, done) => {
//         // console.log(i1)
//         i1.decorate('aaaa', '123123')
//         i1.route({
//           url: 'math.add.i1',
//           handler () {}
//         })
//         i1.route({
//           url: 'math.add.i2',
//           handler () {}
//         })

//         // i1.route()
//         i1.register(
//           beanifyPlugin(
//             (i3, opts, done) => {
//               // console.log(i3)
//               // console.log(i3.$name)
//               console.log({
//                 i3: i3.hasDecorator('aaaa')
//               })
//               // i3.route()
//               i3.register(
//                 beanifyPlugin(
//                   (i4, opts, done) => {
//                     // console.log(i2)
//                     console.log({
//                       i4: i4.hasDecorator('aaaa')
//                     })
//                     // i4.route()
//                     done()
//                   },
//                   {
//                     prefix: 'i4',
//                     name: 'n4'
//                   }
//                 )
//               )
//               done()
//             },
//             {
//               prefix: 'i3',
//               name: 'n3'
//             }
//           )
//         )

//         i1.register(
//           beanifyPlugin(
//             (i5, opts, done) => {
//               // console.log(i2)
//               console.log({
//                 i5: i5.hasDecorator('aaaa')
//               })
//               i5.route({
//                 url: 'math.add.i5',
//                 $usePrefix: false,
//                 handler () {}
//               })
//               // i4.route()
//               done()
//             },
//             {
//               prefix: 'i5',
//               name: 'n5'
//             }
//           )
//         )
//         done()
//       },
//       {
//         prefix: 'i1',
//         name: 'n1'
//       }
//     )
//   )
//   .register(
//     beanifyPlugin(
//       (i2, opts, done) => {
//         // console.log(i2)
//         i2.route({
//           url: 'math.add',
//           handler () {}
//         })
//         console.log({
//           i2: i2.hasDecorator('aaaa')
//         })
//         done()
//       },
//       {
//         prefix: 'i2',
//         name: 'n2'
//       }
//     )
//   )
//   .ready(e => {
//     console.log(e && e.message)
//     beanify.print()
//   })
