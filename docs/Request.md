<h1 align="center">Beanify</h1>

## Request

The first parameter of the `route.handler` function is `Request`.
Request containing the following fields:

- url: the url of the incoming request
- body: the body

```javascript
beanify
  .route({
    url: 'math.add',
    handler (req, rep) {
      console.log(req.url)
      console.log(req.body)
      rep.send(req.body)
    }
  })
  .ready(() => {
    beanify.inject({
      url: 'math.add',
      body: 'aaaa',
      handler (e, data) {
        // data == 'aaaa'
      }
    })
    beanify.inject({
      url: 'math.add',
      body: { b: 123 },
      handler (e, data) {
        // data == {d:123}
      }
    })
  })
```
