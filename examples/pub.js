
var grpc = require('grpc')
var pubsub = grpc.load('definitions/pubsub/broker.proto').pubsub

var client = new pubsub.Broker('localhost:50051',
                                     grpc.credentials.createInsecure())

client.publish({ topic:'test1', messages: [{data: 'test_payload'}]}, function(err, response) {
  console.log(err)
  console.log(response)
})
