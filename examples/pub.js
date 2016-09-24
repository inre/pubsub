/* eslint no-console: off */

const grpc = require('grpc')

const pubsub = grpc.load('definitions/pubsub/broker.proto').pubsub

const topic = process.argv[2]
const payloads = process.argv.slice(3)

if (typeof (topic) !== 'string' || payloads.length === 0) {
  console.log('Usage npm run pub topic payload [payload...]')
  process.exit(0)
}

const client = new pubsub.Broker('localhost:50051',
                                     grpc.credentials.createInsecure())

const messages = payloads.map((payload) => ({ data: payload }))

const message = {
  topic,
  messages,
}

client.publish(message, (err) => {
  if (err) {
    console.log(err)
  }
})
