<h1 align="center">Beanify</h1>

## Reply

The second parameter of the `route.handler` function is `Reply`. Reply that exposes the following functions and properties:

## Methods

### `send(data)`

Sends the payload to the user, could be a plain text, a buffer, JSON

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

### `error(err)`

Sends the error to the user

```javascript
beanify
  .route({
    url: 'math.add',
    handler (req, rep) {
      console.log(req.url)
      console.log(req.body)
      rep.send(req.body)
    },
    onBeforeHandler (req, rep) {
      throw new Error('this message from onBeforeHandler')
    }
  })
  .ready(() => {
    beanify.inject({
      url: 'math.add',
      body: 'aaaa',
      handler (e, data) {
        // e.message == 'this message from onBeforeHandler'
      }
    })
  })
```

```javascript
beanify
  .route({
    url: 'math.add',
    handler (req, rep) {
      const e = new Error('this message from handler')
      rep.error(e)
    },
    onBeforeHandler (req, rep) {}
  })
  .ready(() => {
    beanify.inject({
      url: 'math.add',
      body: 'aaaa',
      handler (e, data) {
        // e.message == 'this message from handler'
      }
    })
  })
```

## Properties

- `$data`: the data will be send to client.visible only after calling the `rep.send` function
- `$sent`: has the data been replied
- `$log`: the logger instance. check [here](https://github.com/pinojs/pino/blob/master/docs/api.md#logger)
