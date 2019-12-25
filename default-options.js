const AJV = require('ajv')
const OS = require('os')
const Util = require('./util')
const ajv = new AJV({
  useDefaults: true
})

const defaultSchema = {
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
    name: {
      type: 'string',
      default: `beanity-${OS.hostname()}-${Util.generateRandomId()}`
    },
    pino: {
      type: 'object',
      properties: {
        level: {
          enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
          default: 'warn'
        }
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
          default: true
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
    }
  }
}

module.exports = (opts) => {
  opts = Object.assign({}, opts)
  ajv.compile(defaultSchema)(opts)
  return opts
}
