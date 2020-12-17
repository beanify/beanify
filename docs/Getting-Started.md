<h1 align="center">Beanify</h1>

# Getting Started

Hello! Thank you for checking out Beanify!
This document aims to be a gentle introduction to the framework and its features. It is an elementary preface with examples and links to other parts of the documentation.
Let's start!

## Install

Install with npm:

```bash
npm i beanify --save
```

Install with yarn:

```bash
yarn add beanify
```

## Your first microservice

Let's write our first server:

```javascript
const beanify = require('beanify')({
  nats: {
    url: 'nats://localhost:4244'
  },
  pino: {
    level: 'debug',
    pertty: true
  }
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

Do you prefer to use async/await? Beanify supports it out-of-the-box.

```javascript
const beanify = require('beanify')({
  nats: {
    url: 'nats://localhost:4244'
  },
  pino: {
    level: 'debug',
    pertty: true
  }
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

Awesome, that was easy.
Unfortunately, writing a complex application requires significantly more code than this example. A classic problem when you are building a new application is how to handle multiple files, asynchronous bootstrapping and the architecture of your code.
Beanify offers an easy platform that helps to solve all of the problems outlined above, and more!

## Your first plugin

Like JavaScript, everything is an object, while in beanify, with the help of avvio, everything is a plug-in. Before we dive into it, let's see how it works! Let's declare our basic server, but not within the entry point, but in an external file

```javascript
// index.js
const beanify = require('beanify')({
  nats: {
    url: 'nats://localhost:4244'
  },
  pino: {
    level: 'debug',
    pertty: true
  }
})
beanify.register(require('./our-first')).ready(async () => {
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

```javascript
// our-first.js
module.exports = function (beanify, opts, done) {
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
  done()
}
```

In this example, we used the **register** API, which is the core of the Beanify framework. It is the only way to add services, plugins, et cetera.
