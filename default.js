const AJV = require('ajv')
const OS = require('os')
const errors = require('./errors')

const ajv = new AJV({
  useDefaults: true
})

const optionsSchema = {
  type: 'object',
  properties: {
    nats: {
      type: 'object',
      properties: {
        json: {
          type: 'boolean',
          default: true
        }
      },
      default: {}
    },
    pino: {
      type: 'object',
      properties: {
        level: {
          enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
          default: 'warn'
        },
        name: {
          type: 'string',
          default: '[Beanity]'
        },
      },
      default: {}
    },
    errio: {
      type: 'object',
      properties: {
        recursive: {
          type: 'boolean',
          default: true
        },
        inherited: {
          type: 'boolean',
          default: true
        },
        stack: {
          type: 'boolean',
          default: false
        },
        private: {
          type: 'boolean',
          default: false
        },
        exclude: {
          type: 'array',
          default: []
        },
        include: {
          type: 'array',
          default: []
        }
      },
      default: {}
    },
    router: {
      type: 'object',
      properties: {
        prefix: {
          type: 'string',
          default: ''
        }
      },
      default: {}
    },
    docs: {
      type: 'object',
      properties: {
        dir: {
          type: 'string',
        },
        enable: {
          type: 'boolean',
          default: true
        }
      },
      default: {}
    }
  }
}

const routeOptionsSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string'
    },
    $useGlobalPrefix: {
      type: 'boolean',
      default: true
    },
    $pubsub: {
      type: 'boolean',
      default: false
    },
    $timeout: {
      type: 'number',
      default: 5000
    },
  },
  default: {},
  required: ['url'],
}

const injectOptionsSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string'
    },
    body: {
      type: ['object', 'string', 'null']
    },
    $useGlobalPrefix: {
      type: 'boolean',
      default: true
    },
    $pubsub: {
      type: 'boolean',
      default: false
    },
    $timeout: {
      type: 'number',
      default: 5000
    }
  },
  default: {},
  required: ['url'],
}

module.exports = {
  options(opts) {
    ajv.compile(optionsSchema)(opts)
    return opts
  },
  routeOptions(opts) {
    ajv.compile(routeOptionsSchema)(opts)
    return opts
  },
  routeValidate(opts) {
    if (ajv.validate(routeOptionsSchema, opts) === false) {
      const err = new errors.BeanifyError(ajv.errorsText(ajv.errors))
      err.message = `routeOptions error: ${err.message}`
      return err
    }
  },
  injectOptions(opts) {
    ajv.compile(injectOptionsSchema)(opts)
    return opts
  },
  injectValidate(opts) {
    if (ajv.validate(injectOptionsSchema, opts) === false) {
      const err = new errors.BeanifyError(ajv.errorsText(ajv.errors))
      err.message = `injectOptions error: ${err.message}`
      return err
    }
  },
}
