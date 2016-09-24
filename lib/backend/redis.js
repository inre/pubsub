const EventEmitter = require('events').EventEmitter

const Redis = require('ioredis')

class RedisBackend extends EventEmitter {
  constructor(redisConfig) {
    super()
    // Serialization disabled by default
    this.serialize = this.deserialize = (x) => x

    this.publisher = new Redis(redisConfig)
    this.subscriber = new Redis(Object.assign({
      autoResubscribe: false,
    }, redisConfig))

    this.subscriber.on('connect', () => {
      this.emit('resubscibe')
    })
    this.subscriber.on('messageBuffer', (topic, payload) => {
      this.emit('message', topic.toString('utf8'), this.deserialize(payload))
    })
  }

  publish(topic, messages) {
    // Fast publish a single message
    if (messages.length === 1) {
      return this.publisher.publish(topic, this.serialize(messages[0]))
    }

    const chain = this.publisher.multi() // is pipeline better?
    messages.forEach((m) => {
      chain.publish(topic, this.deserialize(m))
    })
    return chain.exec()
  }

  subscribe(topics) {
    return this.subscriber.subscribe(...topics)
  }

  unsubscribe(topics) {
    return this.subscriber.unsubscribe(...topics)
  }
}

module.exports = RedisBackend
