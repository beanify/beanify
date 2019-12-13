const SuperError = require('super-error')

const BeanifyError = SuperError.subclass('BeanifyError')
const ParseError = BeanifyError.subclass('BeanifyParseError')
const TimeoutError = BeanifyError.subclass('TimeoutError')
const ResponseError = BeanifyError.subclass('ResponseError')
const PatternNotFound = BeanifyError.subclass('PatternNotFound')
const MaxRecursionError = BeanifyError.subclass('MaxRecursionError')
const ProcessLoadError = BeanifyError.subclass('ProcessLoadError')

module.exports = {
  BeanifyError,
  MaxRecursionError,
  ParseError,
  TimeoutError,
  ResponseError,
  PatternNotFound,
  ProcessLoadError
}
