<h1 align="center">Beanify</h1>

## Route

The `route` method will configure the endpoints of your microservice.

- [Request](./Request.md)
- [Reply](./Reply.md)

### Usage

```javascript
beanify.route(opts, callback)
beanify.route(opts)
```

with options mode

```javascript
beanify.route({
  url: 'math.add',
  handler (req, rep) {}
})
```

with callback mode

```javascript
beanify.route(
  {
    url: 'math.add'
  },
  function (req, rep) {}
)
```

### Options

- `url`: the path of the url to match this route
- `attribute`: will be mapped to the `$attribute` property.default {}
- `$queue`: queue group name.the default is the project name. `$pubsub` will be set to true when customized
- `$pubsub`: if _true_, it means subscription publishing mode, and return value is not supported.default false
- `$timeout`: route registration timeout.default 5000
- `$usePrefix`: if `true`, the url prefix is added automatically,default true
- `handler(req,rep)`: the function that will handle this request

### Properties

- `$beanify`: the scope instance
- `$attribute`: this property is used to transfer special data and will automatically merge the incidental information in the inject
- `$log`: the logger instance. check [here](https://github.com/pinojs/pino/blob/master/docs/api.md#logger)

### Hooks

```javascript
beanify.route({
  url: 'math.add',
  handler (req, rep) {},
  onBeforeHandler (req, rep) {
    // this ： Route
  },
  onAfterHandler (req, rep) {
    // this ： Route
  }
})
```

### Prefix inheritance

```javascript
beanify.register(
  async c1 => {
    c1.route({
      url: 'math.add',
      handler (req, rep) {
        // this.url === 'p1.math.add'
      }
    })
    c1.route({
      url: 'math.sub',
      $usePrefix: false,
      handler (req, rep) {
        // this.url === 'math.sub'
      }
    })
    c1.register(
      async c2 => {
        c2.route({
          url: 'math.next',
          handler (req, rep) {
            // this.url === 'p1.p2.math.next'
          }
        })
        c2.route({
          url: 'math.power',
          $usePrefix: false,
          handler (req, rep) {
            // this.url === 'math.power'
          }
        })
        c2.register(
          async c3 => {
            c3.route({
              url: 'math.random',
              handler (req, rep) {
                // this.url === 'p1.p2.math.random'
              }
            })
          },
          { prefix: 'p3' } // not new scope
        )
      },
      { prefix: 'p2', name: 'c2' }
    )
  },
  { prefix: 'p1', name: 'c1' }
)
```

### \$attribute merge

```javascript
beanify
  .route({
    url: 'math.add',
    attribute: { a: 1 },
    handler (req, rep) {
      this.$attribute.b = 2
      rep.send()
    },
    onBeforeHandler (req, rep) {
      this.$attribute.c = 3
      // this ： Route
    },
    onAfterHandler (req, rep) {
      this.$attribute.d = 4
      // this ： Route
    }
  })
  .ready(() => {
    beanify.inject({
      url: 'math.add',
      attribute: { a: 9, d: 'this is d' },
      handler (e, data) {
        // console.log(this.$attribute)
        // { a: 9, d: 4, c: 3, b: 2 }
      }
    })
  })
```
