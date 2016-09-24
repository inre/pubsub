Feature: Subscribe
  As an Pubsub client,
  I want to receive messages from certain topics

  Scenario: Subscribe on topic
    Given I have initialized gRPC client
    When I subscribe on "topic1" topic
    And I publish on topic "topic1" with payload "payload1"
    Then I expect to receive message from "topic1" with payload "payload1"
