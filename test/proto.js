import test from 'ava'
import proto from '../lib/proto/pubsub/broker_pb'

const StringDecoder = require('string_decoder').StringDecoder

test('serialize/deserialize protobuf', (t) => {
  const payload = new proto.Payload()
  payload.setData(new Uint8Array(new Buffer('sample_payload')))

  const [seconds, nanos] = process.hrtime()
  const publishTime = new proto.Timestamp()
  publishTime.setSeconds(seconds)
  publishTime.setNanos(nanos)

  const storedMessage = new proto.StoredMessage()
  storedMessage.setMessageId('__id')
  storedMessage.setPayload(payload)
  storedMessage.setPublishTime(publishTime)
  const copy = proto.StoredMessage.deserializeBinary(storedMessage.serializeBinary())
  t.is(copy.getMessageId(), '__id')
  t.is(new StringDecoder('utf8').write(Buffer.from(copy.getPayload().getData())), 'sample_payload')
})
