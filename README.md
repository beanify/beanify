<p align="center">
<img src="./imgs/logo.png" alt="Beanify" style="max-width:100%;">
</p>

<p align="center">
A <a href="http://nodejs.org/">Node.js</a> microservices toolkit for the <a href="https://nats.io">NATS messaging system</a>
</p>

* **Node:** v8+
* **Lead Maintainer:** [beanjs](https://github.com/beanjs)


Beanify is an improvement from [Hemera](https://github.com/hemerajs/hemera). First, it improves the microservice registration logic of the __add__ function in Hemera, allowing you to register your microservices in any [beanifyPlugin](https://github.com/beanjs-framework/beanify-plugin), rather than after the ready function is penalized. Secondly, more [lifecycle Hook](./docs/lifecycle-hook.md) functions are provided, allowing you to be more involved in routing registration, service processing, service usage, and so on. Finally, with a more plug-in development approach, deep integration with the [AVVIO](https://github.com/mcollina/avvio) framework, all plug-ins, all services are plug-in

## Documentation

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

* [Installation](./docs/installation.md)
* [lifecycle Hook](./docs/lifecycle-hook.md)
* [Request and Reply](./docs/request-and-reply.md)
* [Publish and Subscribe](./docs/publish-and-subscribe.md)

## Generator

* [beanify-cli](https://github.com/beanjs-framework/beanify-cli)

## Plugins

* [beanify-plugin](https://github.com/beanjs-framework/beanify-plugin)
* [beanify-env](https://github.com/beanjs-framework/beanify-env)
* [beanify-url](https://github.com/beanjs-framework/beanify-url)
* [beanify-autoload](https://github.com/beanjs-framework/beanify-autoload)

## Env

* BEANIFY_NATS_URL
* BEANIFY_NATS_SERVERS
* BEANIFY_NATS_USER
* BEANIFY_NATS_PASS
* BEANIFY_NATS_TOKEN
* BEANIFY_PINO_LEVEL
* BEANIFY_PINO_PERTTY
* BEANITFY_ROUTER_PREFIX

## Professional services

Beanify is free for any use (MIT license). If you are in production don't miss the professional support service. For courses and training send me an email to [502554248@qq.com](502554248@qq.com)