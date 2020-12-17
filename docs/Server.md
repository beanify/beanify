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

Function useful if you need to decorate the beanify instance.check [here](./Decorators.md)

`hasDecorator`

check [here](./Decorators.md)

`register`

Beanify allows the user to extend its functionality with plugins. A plugin can be a set of routes, a server decorator or whatever, check here.
