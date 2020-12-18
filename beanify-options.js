const AJV = require('ajv')
const EnvSchema = require('env-schema')
const Merge = require('merge')
const path = require('path')

const ajv = new AJV({ useDefaults: true })

function fromUserConfig (opts) {
  const optionsSchema = require('./schemas/beanify-options.json')
  ajv.compile(optionsSchema)(opts)
  return opts
}

function fromEnvConfig () {
  const envVal = EnvSchema({
    dotenv: true,
    schema: require('./schemas/beanify-env-options.json')
  })
  const envOpts = {}
  for (const ek in envVal) {
    const segs = ek.toLowerCase().split('_')

    if (envOpts[segs[1]] === undefined) {
      envOpts[segs[1]] = {}
    }

    envOpts[segs[1]][segs[2]] = envVal[ek]
  }
  return envOpts
}

module.exports = function beanifyOptions (opts) {
  //  options from user config
  opts = fromUserConfig(opts || {})

  //  options from environment
  const envOpts = fromEnvConfig()

  // merge options
  opts = Merge.recursive(opts, envOpts)

  // process special
  opts.pino.prettyPrint = opts.pino.pretty
  const cInfo = require(path.join(process.cwd(), 'package.json'))
  opts.pino.name = `[${cInfo.name}]`

  return opts
}
