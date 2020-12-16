const superError = require('super-error')

const BeanifyError = superError.subclass('BeanifyError')
const DecorateExistsError = BeanifyError.subclass(
  'DecorateExistsError',
  function () {
    this.message = 'Decoration has been already added'
  }
)

const PluginVersioMismatchError = BeanifyError.subclass(
  'PluginVersioMismatchError',
  function (name, expected, installed) {
    this.message = `beanify-plugin: ${name} - expected '${expected}' beanify version, '${installed}' is installed`
  }
)

const RouteOptionsError = BeanifyError.subclass('RouteOptionsError')

const InjectOptionsError = BeanifyError.subclass('InjectOptionsError')

const InjectTimeoutError = BeanifyError.subclass(
  'InjectTimeoutError',
  function (url) {
    this.message = `inject timeout: ${url}`
  }
)

const HookCallbackError = BeanifyError.subclass(
  'HookCallbackError',
  function () {
    this.message = 'hook callback not allow arrow function'
  }
)

module.exports = {
  BeanifyError,
  DecorateExistsError,
  PluginVersioMismatchError,
  RouteOptionsError,
  InjectOptionsError,
  InjectTimeoutError,
  HookCallbackError
}
