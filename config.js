const fs = require('fs')

const CONFIG_FILE = 'config/config.json'

// We can override the default configuration in `config/config.json`
const defaultConfig = {
  // Setting for the backend module
  backend: {
    name: 'redis',
  },
  // Settings for the server module
  server: {

  },
  // Settings for the broker class
  broker: {
    maxSubscribersOnTopic: 100,
  },
  // Requered for `redis` backend
  redis: {
    host: '127.0.0.1',
    port: 6379,
    password: null,
    db: 0,
  },
  // Required for `grpc` server
  grpc: {
    proto: 'definitions/pubsub/broker.proto',
    address: '0.0.0.0:50051',
  },
  config: {
    file: 'config.json',
  },
}

const config = {}

// Reload the configuration from file
config.reload = function () {
  Object.assign(config, defaultConfig)

  try {
    fs.statSync(CONFIG_FILE)
    Object.assign(config, JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')))
  } catch (es) {
    // continue regardless of error
  }
}

// Fill the config the first time
config.reload()

module.exports = config
