const pubsub = require('./index')

const config = require('./config')

const backend = new pubsub.backend.Redis(config.backend)
const broker = new pubsub.Broker(backend, config.broker)
const server = new pubsub.server.Grpc(broker, config.grpc)

server.start()

// broker.on('publish', () =>)
