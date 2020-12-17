<h1 align="center">Beanify</h1>

## Factory

The Beanify module exports a factory function that is used to create new Beanify server instances. This factory function accepts an options object which is used to customize the resulting instance. This document describes the properties available in that options object.

### `nats`

This property is used to configure the internal `$nats` instance.check [here](https://github.com/nats-io/nats.js#connect-options)

### `pino`

Beanify includes built-in logging via the Pino logger. This property is used to configure the internal `$log` instance.check [here](https://github.com/pinojs/pino/blob/master/docs/api.md#options)

### `errio`

This property is used to configure the internal `$errio` instance.check [here](https://github.com/causal-agent/errio#options)

### `router`

- **prefix**:Global URL prefix

## Instance

### Server Methods

`decorate`

Function useful if you need to decorate the beanify instance.check [here](./Decorators.md#Usage)

`hasDecorator`

check [here](./Decorators.md#Usage)

`register`

Beanify allows the user to extend its functionality with plugins. A plugin can be a set of routes, a server decorator or whatever, check [here](./Plugins.md).

`after`

Invoked when the current plugin and all the plugins that have been registered within it have finished loading. It is always executed before the method beanify.ready

```javascript
beanify
  .register(async (instance, opts) => {
    console.log('Current plugin')
  })
  .after(err => {
    console.log('After current plugin')
  })
  .register(async (instance, opts) => {
    console.log('Next plugin')
  })
  .ready(err => {
    console.log('Everything has been loaded')
  })

// Current plugin
// After current plugin
// Next plugin
// Everything has been loaded
```

`ready`

Function called when all the plugins have been loaded. It takes an error parameter if something went wrong.

```javascript
beanify.ready().then(
  () => {
    console.log('successfully booted!')
  },
  err => {
    console.log('an error happened', err)
  }
)
```

`close`

call this function to close the server instance and run the `onClose` hook

```javascript
beanify.close().then(
  () => {
    console.log('successfully closed!')
  },
  err => {
    console.log('an error happened', err)
  }
)
```

`addHook`

Function to add a specific hook in the lifecycle of Beanify, check [here](./Hooks.md).
