<div align="center">
<img src="./imgs/beanify.png" alt="Beanify" style="width:64px">
<h1>Beanify</h1>
</div>

<p align="center">
A <a href="http://nodejs.org/">Node.js</a> microservices toolkit for the <a href="https://nats.io">NATS messaging system</a>
</p>

Beanify is an improvement from [Hemera](https://github.com/hemerajs/hemera). First, it improves the microservice registration logic of the **add** function in Hemera, allowing you to register your microservices in any [beanifyPlugin](https://github.com/beanjs-framework/beanify-plugin), rather than after the ready function is penalized. Secondly, more [lifecycle Hook](./docs/lifecycle-hook.md) functions are provided, allowing you to be more involved in routing registration, service processing, service usage, and so on. Finally, with a more plug-in development approach, deep integration with the [AVVIO](https://github.com/mcollina/avvio) framework, all plug-ins, all services are plug-in

## Requirements

Node.js v10 LTS (10.16.0) or later.

## Quick start

## Install

## Example

## Documentation

- [Installation](./docs/installation.md)
- [lifecycle Hook](./docs/lifecycle-hook.md)
- [Request and Reply](./docs/request-and-reply.md)
- [Publish and Subscribe](./docs/publish-and-subscribe.md)

## Ecosystem

- [beanify-plugin](https://github.com/beanify/beanify-plugin)

* [beanify-cli](https://github.com/beanjs-framework/beanify-cli)
* [beanify-env](https://github.com/beanjs-framework/beanify-env)
* [beanify-url](https://github.com/beanjs-framework/beanify-url)
* [beanify-autoload](https://github.com/beanjs-framework/beanify-autoload)

## Environment

- BEANIFY_NATS_URL
- BEANIFY_NATS_SERVERS
- BEANIFY_NATS_USER
- BEANIFY_NATS_PASS
- BEANIFY_NATS_TOKEN
- BEANIFY_PINO_LEVEL
- BEANIFY_PINO_PERTTY
- BEANIFY_ROUTER_PREFIX
- NODE_ENV
