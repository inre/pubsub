
module.exports.Redis = require('./redis')

const backends = {}
Object.keys(module.exports).forEach((type) => {
  backends[type.toLowerCase()] = module.exports[type]
})

module.exports.getBackend = function (name) {
  return backends[name]
}

module.exports.listBackends = function () {
  Object.keys(backends)
}
