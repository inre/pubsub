const path = require('path')
const grpc = require('grpc')
const debug = require('debug')('pubsub:grpc')

function empty(callback) {
  debug('response -> empty')
  callback(null, {})
}

function unavailable(callback) {
  debug('response -> unavailable')
  callback({
    code: grpc.status.UNAVAILABLE,
    details: 'Unavailable',
  })
}

class Service {
  constructor(broker) {
    this.broker = broker
  }

  publish(call, callback) {
    debug('request -> publish')
    const topic = call.request.topic
    const payloadArray = call.request.messages.map((m) => m.data)
    const fut = this.broker.publish(topic, payloadArray)
    fut.then(() => empty(callback))
       .catch(() => unavailable(callback))
  }

  subscribe(stream) {
    debug('request -> subscribe')
    let limit = stream.request.maxMessages
    const handler = (message) => {
      const map = message.toMap()
      debug(`response -> stream ${map.topic}`)
      stream.write(map)
      if (limit === 0) {
        if (limit === 1) {
          stream.end()
        } else {
          limit -= 1
        }
      }
    }
    const done = () => {
      stream.end()
      this.broker.unsubscribe(stream.request.topics, handler)
    }
    stream.on('end', done)
    this.broker.subscribe(stream.request.topics, handler)
  }
}

class Server {
  constructor(broker, grpcConfig) {
    this.broker = broker
    this.proto = grpc.load(path.join(__dirname, '../../', grpcConfig.proto))
    this.server = new grpc.Server()
    this.service = new Service(broker)

    this.server.addProtoService(this.proto.pubsub.Broker.service, {
      publish: (call, callback) => this.service.publish(call, callback),
      subscribe: (stream) => this.service.subscribe(stream),
    })
    // FIXME: set up SSL credentails
    this.server.bind(grpcConfig.address, grpc.ServerCredentials.createInsecure())
  }

  start() {
    debug('starting gRPC')
    this.server.start()
  }
}

module.exports.Service = Service
module.exports.Server = Server
