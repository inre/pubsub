require './features/support/pubsub/pubsub'

include Pubsub

@service = Broker::Stub.new('localhost:50051', :this_channel_is_insecure)

message = PublishMessages.new(topic: "pubsub_test", messages: [Payload.new(data: "test_payload")])
puts @service.publish(message)
