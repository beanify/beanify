<h1 align="center">Beanify</h1>

## Hooks

Hooks are registered with the `beanify.addHook` method and allow you to listen to specific events in the instance or Route/Inject lifecycle. You have to register a hook before the event is triggered, otherwise the event is lost.

By using hooks you can interact directly with the lifecycle of beanify. There are Route/Inject hooks and instance hooks:

- Route Hooks
  - onBeforeHandler
  - onAfterHandler
- Inject Hooks
  - onBeforeInject
  - onAfterInject
- instance Hooks
  - onClose
  - onRoute
  - onError

**Attention**: The hook callback function cannot use the arrow function because it needs to bind the this pointer

## Global level hooks

### `onBeforeHandler`

Will be triggered before calling `route.handler`

```javascript
beanify.addHook('onBeforeHandler', function (req, rep) {
  // this : Route
  // req : Request
  // rep ：Reply
})
```

### `onAfterHandler`

Will be triggered after calling `route.handler`

```javascript
beanify.addHook('onAfterHandler', function (req, rep) {
  // this : Route
  // req : Request
  // rep ：Reply
})
```

### `onBeforeInject`

Will be triggered before sending inject

```javascript
beanify.addHook('onBeforeInject', function () {
  // this : Inject
})
```

### `onAfterInject`

Will be triggered after the inject process is completed

```javascript
beanify.addHook('onAfterInject', function () {
  // this : Inject
})
```

### `onClose`

Triggered when beanify.close() is invoked to stop the instance.

```javascript
beanify.addHook('onClose', function () {
  // this : Beanify
})
```

### `onRoute`

Will be triggered before a new route is register.

```javascript
beanify.addHook('onRoute', function (route) {
  // this : Beanify
  // route : Route
})
```

### `onError`

```javascript
beanify.addHook('onError', function (e) {
  // this : Beanify
  // e : Error
})
```

## Route level hooks

```javascript
beanify.route(
  url:'math.add',
  handler(){}
  onBeforeHandler(req,rep){
    // this : Route
    // req ：Request
    // rep : Reply
  },
  onAfterHandler(req,rep){
    // this : Route
    // req ：Request
    // rep : Reply
  }
)
```

## Inject level hooks

```javascript
beanify.inject(
  url:'math.add',
  handler(){}
  onBeforeInject(){
    // this : Inject
  },
  onAfterInject(req,rep){
    // this : Inject
  }
)
```
