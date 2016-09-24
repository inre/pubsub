
var grpc = require('grpc')
var pubsub = grpc.load('definitions/pubsub/broker.proto').pubsub

var client = new pubsub.Broker('localhost:50051',
                                     grpc.credentials.createInsecure())
                                     
call = client.subscribe({topics: ['test1'], maxMessages: 1})
call.on('data', (data) => console.log(data))
call.on('end', () => console.log('end'))
