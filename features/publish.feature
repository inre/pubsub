Feature: Publish
  As an Pubsub client,
  I want to publish arbitrary messages to Pubsub broker

  Scenario: Publish a single message
    Given I have initialized gRPC client
    When I publish on topic "sample_topics" with payload "sample_payload"
    Then I should receive empty response
