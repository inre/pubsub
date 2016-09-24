const uuid = require('uuid')

const proto = require('./proto/pubsub/broker_pb')

class Payload {
  constructor(data) {
    if (typeof (data) === 'object' && data instanceof Buffer) {
      this.data = new Uint8Array(data)
    } else if (typeof (data) === 'object' && data instanceof Uint8Array) {
      this.data = data
    } else if (typeof (data) === 'string') {
      this.data = new Uint8Array(new Buffer(data))
    } else {
      throw new Error('Unrecognized payload type')
    }
  }

  static fromProto(protoPl) {
    const data = protoPl.getData()
    return new Payload(data)
  }

  toProto() {
    const protoPl = new proto.Payload()
    protoPl.setData(this.data)
    return protoPl
  }
}

class Timestamp {
  constructor(seconds, nanos) {
    this.seconds = seconds
    this.nanos = nanos
  }

  static now() {
    const [seconds, nanos] = process.hrtime()
    return new Timestamp(seconds, nanos)
  }

  static fromProto(protoTs) {
    const seconds = protoTs.getSeconds()
    const nanos = protoTs.getNanos()
    return new Timestamp(seconds, nanos)
  }

  toProto() {
    const protoTs = new proto.Timestamp()
    protoTs.setSeconds(this.seconds)
    protoTs.setNanos(this.nanos)
    return protoTs
  }
}

class Message {
  constructor(topic, payload, messageId, publishTime) {
    this.topic = topic.toString()
    this.messageId = messageId || uuid.v1()
    this.payload = new Payload(payload)
    this.publishTime = publishTime || Timestamp.now()
  }

  toReceivedMessage() {
    const protoRm = new proto.ReceivedMessage()
    protoRm.setTopic(this.topic)
    protoRm.setMessageId(this.messageId)
    protoRm.setPayload(this.payload.toProto())
    protoRm.setPublishTime(this.publishTime.toProto())
    return protoRm
  }

  toMap() {
    return {
      topic: this.topic,
      message_id: this.messageId,
      payload: {
        data: this.payload.data,
      },
      publish_time: {
        seconds: this.publishTime.seconds,
        nanos: this.publishTime.nanos,
      }
    }
  }

  static fromStoredMessage(storedMsg, topic) {
    const messageId = storedMsg.getMessageId()
    const payload = storedMsg.getPayload().getData()
    const protoPt = storedMsg.getPublishTime()
    const publishTime = new Timestamp(protoPt.getSeconds(), protoPt.getNanos())
    return new Message(topic.toString(), payload, messageId, publishTime)
  }

  toStoredMessage() {
    const protoSm = new proto.StoredMessage()
    protoSm.setMessageId(this.messageId)
    protoSm.setPayload(this.payload.toProto())
    protoSm.setPublishTime(this.publishTime.toProto())
    return protoSm
  }
}

module.exports.Payload = Payload
module.exports.Timestamp = Timestamp
module.exports.Message = Message
