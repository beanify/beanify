<h1 align="center">Beanify</h1>

## Inject

The `inject` method will call the endpoint of your microservice

## Usage

```javascript
beanify.inject(opts)
beanify.inject(opts, callback)
```

with async-await:

```javascript
// If you use the async-await mode, you must not set otps.handler
const res = await beanify.inject(opts)
```

### Options

- `url`: the path of the url to call
- `body`: parameters to be passed to `Request.body`
- `attribute`: will be mapped to the `$attribute` property.default {}
- `context`: will be mapped to the `$context` property.default {}
- `$pubsub`: if _true_, it means subscription publishing mode, and not need wait to url reply.default false
- `$timeout`: call timeout settings,default 5000
- `$usePrefix`: if `true`, the url prefix is added automatically,default false
- `handler(e,data)`: the callback function that receives data when the request is completed

### Properties

- `$parent`: parent inject object
- `$beanify`: the scope instance
- `$attribute`: this property is used to transfer special data and will automatically merge the incidental information in the `inject` receives data.This property will not be inherited from the parent
- `$context`: if you want to set a context across all calls you can use the `$context` property.This property will be inherited from the parent
- `$log`: the logger instance. check [here](https://github.com/pinojs/pino/blob/master/docs/api.md#logger)

### Hooks

```javascript
beanify.route({
  url: 'math.add',
  handler (req, rep) {},
  onBeforeInject () {
    // this ： Inject
  },
  onAfterInject (req, rep) {
    // this ： Inject
  }
})
```

### Methods

#### `inject`

Chained microservice calls can pass `$attribute` and `$context`

```javascript
// callback mode
beanify
  .route({
    url: 'math.add',
    handler (req, rep) {
      this.$attribute.a = 10
      rep.send(req.body)
    }
  })
  .ready(() => {
    beanify.inject({
      url: 'math.add',
      attribute: { b: 'aaaa' },
      context: { c: 111 },
      body: 'first',
      handler (e, data) {
        console.log(data) // first
        console.log(this.$attribute) // { b: 'aaaa', a: 10 }
        console.log(this.$context) // { c: 111 }

        this.inject({
          url: 'math.add',
          body: 'second',
          attribute: { c: 18888 },
          handler (e, data) {
            console.log(data) // second
            console.log(this.$attribute) // { c: 18888, a: 10 }
            console.log(this.$context) // { c: 111 }

            this.inject({
              url: 'math.add',
              body: 'third',
              context: { ddd: 'this is ddd', c: 'this is c' },
              handler (e, data) {
                console.log(data) // third
                console.log(this.$attribute) // { a: 10 }
                console.log(this.$context) // { c: 'this is c', ddd: 'this is ddd' }
              }
            })

            this.inject({
              url: 'math.add',
              body: 'fourth',
              context: { fff: 'this is fff' },
              handler (e, data) {
                console.log(data) // fourth
                console.log(this.$attribute) // { a: 10 }
                console.log(this.$context) // { c: 111, fff: 'this is fff' }
              }
            })
          }
        })
      }
    })
  })
```

```javascript
// async/await mode
beanify
  .route({
    url: 'math.add',
    handler (req, rep) {
      this.$attribute.a = 10
      rep.send(req.body)
    }
  })
  .ready(() => {
    beanify.inject({
      url: 'math.add',
      attribute: { b: 'aaaa' },
      context: { c: 111 },
      body: 'first',
      handler (e, data) {
        console.log(data) // first
        console.log(this.$attribute) // { b: 'aaaa', a: 10 }
        console.log(this.$context) // { c: 111 }

        this.inject({
          url: 'math.add',
          body: 'second',
          attribute: { c: 18888 },
          async handler (e, data) {
            console.log(data) // second
            console.log(this.$attribute) // { c: 18888, a: 10 }
            console.log(this.$context) // { c: 111 }

            data = await this.inject({
              url: 'math.add',
              body: 'third',
              context: { ddd: 'this is ddd', c: 'this is c' }
            })
            console.log(data) // third
            console.log(this.$attribute) // { a: 10 }
            console.log(this.$context) // { c: 'this is c', ddd: 'this is ddd' }

            data = await this.inject({
              url: 'math.add',
              body: 'fourth',
              context: { fff: 'this is fff' }
            })
            console.log(data) // fourth
            console.log(this.$attribute) // { a: 10 }
            console.log(this.$context) // { c: 'this is c', ddd: 'this is ddd', fff: 'this is fff' }

            data = await this.inject({
              url: 'math.add',
              body: 'fifth'
            })

            console.log(data) // fifth
            console.log(this.$attribute) // { a: 10 }
            console.log(this.$context) // { c: 'this is c', ddd: 'this is ddd', fff: 'this is fff' }
          },
          onAfterInject () {
            console.log(this.$attribute) // { c: 18888, a: 10 }
            console.log(this.$context) // { c: 111 }
          }
        })

        console.log(data) // first
        console.log(this.$attribute) // { b: 'aaaa', a: 10 }
        console.log(this.$context) // { c: 111 }
      },
      onAfterInject () {
        console.log(this.$attribute) // { b: 'aaaa', a: 10 }
        console.log(this.$context) // { c: 111 }
      }
    })
  })
```
