const envSchema = require("env-schema")
const objMerge = require("merge")

const SchemaOptions = {
  dotenv: true,
  schema: {
    type: 'object',
    properties: {
      BEANIFY_NATS_URL: {
        type: "string"
      },
      BEANIFY_NATS_SERVERS: {
        type: 'string',
        separator: ","
      },
      BEANIFY_NATS_USER: {
        type: 'string'
      },
      BEANIFY_NATS_PASS: {
        type: 'string'
      },
      BEANIFY_NATS_TOKEN: {
        type: 'string'
      },
      BEANIFY_PINO_LEVEL: {
        enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
        default: "debug"
      },
      BEANIFY_PINO_PERTTY: {
        type: 'boolean',
        default: false
      },
      BEANITFY_ROUTER_PREFIX: {
        type: 'string',
        default: ''
      },
    }
  }
}

module.exports = (beanify, opts, done) => {

  envObj = envSchema(SchemaOptions)

  envOptions = {}

  Object.keys(envObj)
    .forEach((key) => {
      const segs = key.toLowerCase().split('_')

      if (envOptions[segs[1]] == undefined) {
        envOptions[segs[1]] = {}
      }

      envOptions[segs[1]][segs[2]] = envObj[key]

    })

  // override $root._options filed
  beanify.$root._options = objMerge.recursive(beanify.$root._options, envOptions)

  done()
}
