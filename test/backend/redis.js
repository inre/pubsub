import test from 'ava'
import Redis from '../../lib/backend/redis'
import config from '../../config'

const testTopic = '__pubsub_test_queue'
const testPayload = '__pubsub_payload_example'
let redis

test.beforeEach(() => {
  redis = new Redis(config.redis)
})

test.cb('simple publish then subscribe', (t) => {
  t.plan(1)
  redis.subscribe([testTopic]).then(() => {
    redis.publish(testTopic, [testPayload])
  })
  redis.on('message', (topic, payload) => {
    if (topic === testTopic) {
      t.is(payload.toString('utf8'), testPayload)
      t.end()
    }
  })
})
