const AVVIO = require('avvio')
// const FastQ = require('fastq')
// const Errio = require('errio')

const beanifyPlugin = require('beanify-plugin')

const errors = require('./errors')
const defaults = require('./default')
const { sPluginNames, sChildren } = require('./symbols')

class Beanify {
  constructor(options) {
    this._root = this
    this._options = defaults.options(options)
    this._current = null

    this._avvio = AVVIO(this, {
      expose: {
        use: '_use',
        ready: '_ready'
      },
      autostart: true,
      timeout: 5000
    })

    this[sPluginNames] = []
    this[sChildren] = []

    this._avvio.override = (beanify, plugin, opts) => {
      const meta = plugin[beanifyPlugin.pluginMeta]
      const pluginPrefix = plugin[beanifyPlugin.pluginPrefix]
      const beanifyPrefix = beanify[beanifyPlugin.pluginPrefix]

      if (meta) {
        beanify._checkPluginDependencies(plugin)
        beanify._checkPluginDecorators(plugin)

        if (this._root[sPluginNames].indexOf(meta.name) > -1 && meta.name != 'beanify-autoload') {
          throw new errors.BeanifyError(`plugin(${meta.name}) has been already added`)
        }

        if (this._root[sPluginNames].indexOf(meta.name) == -1) {
          this._root[sPluginNames].push(meta.name)
        }
      }

      if (plugin[beanifyPlugin.pluginScoped] === false) {
        if (beanifyPrefix && pluginPrefix !== '' && beanifyPrefix !== pluginPrefix) {
          throw new errors.BeanifyError(`has prefix:${beanifyPrefix} in this scoped,new prefix:${pluginPrefix}`)
        }

        beanify[beanifyPlugin.pluginPrefix] = pluginPrefix
        this._current = beanify
        return beanify
      }

      const scopedInstance = Object.create(beanify)
      this._current = scopedInstance

      beanify[sChildren].push(scopedInstance)
      scopedInstance[sChildren] = []
      scopedInstance[beanifyPlugin.pluginPrefix] = pluginPrefix

      // add hook

      scopedInstance.decorate = function decorate() {
        beanify.decorate.apply(this._root, arguments)
        return scopedInstance
      }

      return scopedInstance
    }

    this._avvio.once('preReady', () => {
      this._current = null
    })

    this._registerPlugins()
  }

  get $options() {
    return this._options
  }

  get $avvio() {
    return this._avvio
  }

  get $plugins() {
    return this._root[sPluginNames]
  }

  get $root() {
    return this._root
  }

  decorate(prop, value, deps) {
    if (prop in this) {
      throw new errors.BeanifyError('Decoration has been already added')
    }

    if (deps) {
      this._checkDecorateDependencies(deps)
    }

    this[prop] = value

    return this
  }

  hasDecorator(prop) {
    return prop in this
  }

  register(plugin, opts) {
    const pluginMeta = plugin[beanifyPlugin.pluginMeta]
    let pluginOpts = pluginMeta ? pluginMeta.options : {}

    pluginOpts = Object.assign({}, pluginOpts, opts)
    this._use(plugin, pluginOpts)
    return this
  }

  ready(callback) {
    const _readyCaller = (err) => {
      callback.bind(this.$injectDomain || this)(err)
    }
    this._ready(_readyCaller)
    return this
  }

  _checkDecorateDependencies(deps) {
    for (let i = 0; i < deps.length; i++) {
      if (!(deps[i] in this)) {
        throw new errors.BeanifyError(`Missing member dependency '${deps[i]}'`)
      }
    }
  }

  _checkPluginDependencies(plugin) {
    const meta = plugin[beanifyPlugin.pluginMeta]

    const { dependencies } = meta
    if (!dependencies) {
      return
    }

    if (!Array.isArray(dependencies)) {
      throw new errors.BeanifyError('Plugin dependencies must be an array of strings')
    }

    dependencies.forEach((dependency) => {
      if (this._root[sPluginNames].indexOf(dependency) === -1) {
        throw new errors.BeanifyError(`The dependency '${dependency}' is not registered`)
      }
    })
  }

  _checkPluginDecorators(plugin) {
    const meta = plugin[beanifyPlugin.pluginMeta]

    const { decorators } = meta
    if (!decorators) {
      return
    }

    if (!Array.isArray(decorators)) {
      throw new errors.BeanifyError('Plugin decorators must be an array of strings')
    }

    decorators.forEach((decorate) => {
      if (!this.hasDecorator(decorate)) {
        throw new errors.BeanifyError(`The decorator dependency '${decorate}' is not registered`)
      }
    })
  }

  _registerPlugins() {
    // load config form env vars
    this.register(require('./plugins/env'))
      .after(() => {
        
        this._options.pino.prettyPrint = this._options.pino.pretty
        this.register(require('./plugins/logger'), this._options.pino)

        this.register(require('./plugins/errio'), this._options.errio)

        this.register(require('./plugins/nats'), this._options.nats)

        this.register(require('./plugins/router'), this._options.router)

        this.register(require('./plugins/ajv'))

        this.register(require('./plugins/trace'))

        this.register(require('./plugins/docs'), this._options.docs)
      })
  }
}

module.exports = Beanify
