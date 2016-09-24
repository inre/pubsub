
var grpc = require('grpc')
var pubsub = grpc.load('definitions/pubsub/broker.proto').pubsub

const topics = process.argv.slice(2)

if (topics.length === 0) {
  console.log('Usage npm run sub topic [topic...]')
  process.exit(0)
}

var client = new pubsub.Broker('localhost:50051',
                                     grpc.credentials.createInsecure())

call = client.subscribe({topics: topics, maxMessages: 1})
call.on('data', (data) => console.log(data))
call.on('end', () => console.log('end'))
