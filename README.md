<div align="center">
<img src="./imgs/beanify.png" alt="Beanify" style="width:32px">
<h1>Beanify</h1>
</div>

<p align="center">
A <a href="http://nodejs.org/">Node.js</a> microservices toolkit for the <a href="https://nats.io">NATS messaging system</a>
</p>

Beanify's inspiration came from working with [Hemera](https://github.com/hemerajs/hemera). After 3 versions of iteration, it has become a low-cost, high load capacity microservice framework. With beanify, you can start any number of services on different hosts to ensure maximum availability.

## Requirements

Node.js v10 LTS (10.16.0) or later.

## Features

- **Lightweight**: The Beanify is small as possible and provide an extensive plugin system.
- **Location transparency**: A service may be instantiated in different locations at different times. An application interacting with an service and does not know the service physical location.
- **Service Discovery**: You don't need a service discovery all subscriptions are managed by NATS.
- **Load Balancing**: Requests are load balanced (random) by NATS mechanism of "queue groups".
- **High performant**: NATS is able to handle million of requests per second.
- **Scalability**: Filtering on the subject name enables services to divide work (perhaps with locality).
- **Fault tolerance**: Auto-heals when new services are added. Configure cluster mode to be more reliable.
- **Extendible**: Beanify is fully extensible via its hooks, plugins and decorators.
- **Developer friendly**: the framework is built to be very expressive and help the developer in their daily use, without sacrificing performance and security.
- **Request & Reply**: By default point-to-point involves the fastest or first to respond.
- **Publish & Subscribe**: Beanify supports all features of NATS. This includes wildcards in subjects and normal publish and queue mechanism.

## Environment

- BEANIFY_NATS_URL: NATS connection url
- BEANIFY_NATS_SERVERS: NATS connection servers
- BEANIFY_NATS_USER: NATS authentication user
- BEANIFY_NATS_PASS: NATS authentication password
- BEANIFY_NATS_TOKEN: NATS authentication token
- BEANIFY_PINO_LEVEL: Log level
- BEANIFY_PINO_PRETTY: The log is output in pretty style
- BEANIFY_ROUTER_PREFIX: Global URL prefix

## Install

If installing in an existing project, then Beanify can be installed into the project as a dependency:

Install with npm:

```bash
npm i beanify --save
```

Install with yarn:

```bash
yarn add beanify
```

## Example

```javascript
const beanify = require('beanify')({
  // nats:{}
  // pino:{}
  // errio:{}
  // router:{}
})

beanify
  .route({
    url: 'math.add',
    handler (req, rep) {
      const { a, b } = req.body
      rep.send(a + b)
    }
  })
  .route({
    url: 'math.sub',
    handler (req, rep) {
      const { a, b } = req.body
      rep.send(a - b)
    }
  })
  .ready(() => {
    beanify.inject({
      url: 'math.add',
      body: {
        a: 1,
        b: 2
      },
      handler (e, sum) {
        console.log(e, sum)
      }
    })
  })
```

with async-await:

```javascript
const beanify = require('beanify')({
  // nats:{}
  // pino:{}
  // errio:{}
  // router:{}
})

beanify
  .route({
    url: 'math.add',
    async handler (req) {
      const { a, b } = req.body
      return a + b
    }
  })
  .route({
    url: 'math.sub',
    async handler (req) {
      const { a, b } = req.body
      return a - b
    }
  })
  .ready(async () => {
    const sum = await beanify.inject({
      url: 'math.add',
      body: {
        a: 1,
        b: 2
      }
    })
    console.log({ sum })
  })
```

## Documentation

- [Getting Started](./docs/Getting-Started.md)
- [Encapsulation](./docs/Encapsulation.md)
- [Decorators](./docs/Decorators.md)
- [Plugins](./docs/Plugins.md)
- [Hooks](./docs/Hooks.md)
- [Route](./docs/Route.md)
- [Inject](./docs/Inject.md)
- [Request](./docs/Request.md)
- [Reply](./docs/Reply.md)
- [Beanify](./docs/Beanify.md)

<!-- - [Request and Reply](./docs/request-and-reply.md)
- [Publish and Subscribe](./docs/publish-and-subscribe.md) -->

## Ecosystem

- [beanify-plugin](https://github.com/beanify/beanify-plugin)
- [beanify-autoload](https://github.com/beanify/beanify-autoload)

<!-- * [beanify-cli](https://github.com/beanjs-framework/beanify-cli)
* [beanify-env](https://github.com/beanjs-framework/beanify-env)
* [beanify-url](https://github.com/beanjs-framework/beanify-url)
* [beanify-autoload](https://github.com/beanjs-framework/beanify-autoload) -->
