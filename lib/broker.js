const EventEmitter = require('events').EventEmitter
const debug = require('debug')('pubsub:broker')
const proto = require('./proto/pubsub/broker_pb')
const Message = require('./message').Message

class Broker extends EventEmitter {
  constructor(backend, brokerSettings) {
    super()
    this.setMaxListeners(brokerSettings.maxSubscribersOnTopic)
    this.backend = backend
    this.subscriptions = new Set()
    this.settings = brokerSettings

    // Change the backend serialization method
    this.backend.serialize = (storedMessage) => Buffer.from(storedMessage.serializeBinary())
    this.backend.deserialize = (data) => proto.StoredMessage.deserializeBinary(new Uint8Array(data))

    this.backend.on('message', (topic, storedMessage) => {
      const message = Message.fromStoredMessage(storedMessage, topic)
      debug(`<<< incomming ${topic}`)
      this.emit(topic, message)
    })

    this.backend.on('resubscribe', () => {
      debug(`resubscribe on ${this.subscriptions.size} topics`)
      this.subscribe(...this.subscriptions.values())
    })
  }

  publish(topic, payloadArray) {
    debug(`>>> outgoing ${topic} ${payloadArray.length} messages`)
    const messages = payloadArray.map((payload) => new Message(topic, payload))
    const storedMessages = messages.map((message) => message.toStoredMessage())
    return this.backend.publish(topic, storedMessages)
  }

  subscribe(topics, handler) {
    debug(`subscribe to ${topics.join(' ')}`)
    const subscribeToTopics = topics.filter(() => !this.subscriptions.has(topics))
    subscribeToTopics.forEach((t) => {
      this.subscriptions.add(t)
      // Bind handler too
      this.on(t, handler)
    })
    if (subscribeToTopics.length !== 0) {
      this.backend.subscribe(subscribeToTopics)
    }
  }

  unsubscribe(topics, handler) {
    debug(`unsubscribe from ${topics.join(' ')}`)
    const unsubscribeFromTopics = topics.map((topic) => {
      this.removeListener(topic, handler)
      if (this.listenerCount(topic) === 0) {
        this.unsubscriptions.remove(topic)
        return true
      }
      return false
    })
    if (unsubscribeFromTopics.length !== 0) {
      this.backend.unsubscribe(unsubscribeFromTopics)
    }
  }
}

module.exports = Broker
