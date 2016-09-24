require 'rspec'
require 'thread/channel'

include Pubsub

Before do
  @server = Server.new(debug: (ENV['DEBUG'] == '1'))
end

After do
  puts "finalize"
  @server.finalize
end

Given(/^I have initialized gRPC client$/) do
  @service = Broker::Stub.new('localhost:50051', :this_channel_is_insecure)
end

When(/^I publish on topic "([^"]*)" with payload "([^"]*)"$/) do |topic, payload|
  message = PublishMessages.new(topic: topic, messages: [
    Payload.new(data: payload)
  ])
  @last_response = @service.publish(message)
end

Then(/^I should receive empty response$/) do
  expect(@last_response).to be_kind_of(Empty)
end

When(/^I subscribe on "([^"]*)" topic$/) do |topic|
  @channel = Thread.channel

  subscription = Subscription.new(topics: [topic], maxMessages: 1)
  stream = @service.subscribe(subscription)
  Thread.new do
    stream.each do |message|
      @channel.send message
    end
  end
end

Then(/^I expect to receive message from "([^"]*)" with payload "([^"]*)"$/) do |topic, payload|
  message = @channel.receive
  expect(message).to be_kind_of(ReceivedMessage)
  expect(message.topic).to eq(topic)
  expect(message.payload.data).to eq(payload)
end
