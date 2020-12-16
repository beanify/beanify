const { kRouteAttribute } = require('./symbols')

function Route (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }

  this[kRouteAttribute] = this.attribute
  delete this.attribute
}

// Route.prototype.inject = function () {
//   for (const k in this) {
//     console.log({
//       k
//     })
//   }
//   console.log(this[kRouteBeanify].$name)
// }

module.exports = Route
