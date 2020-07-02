const SuperError = require('super-error')

const BeanifyError = SuperError.subclass('BeanifyError')
const SchemaError = BeanifyError.subclass('SchemaError')
const TimeoutError = BeanifyError.subclass('TimeoutError')
const ResponseError = BeanifyError.subclass('ResponseError')
const PatternNotFound = BeanifyError.subclass('PatternNotFound')
const MaxRecursionError = BeanifyError.subclass('MaxRecursionError')
const ProcessLoadError = BeanifyError.subclass('ProcessLoadError')

module.exports = {
  BeanifyError,
  MaxRecursionError,
  SchemaError,
  TimeoutError,
  ResponseError,
  PatternNotFound,
  ProcessLoadError
}
