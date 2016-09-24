# Pubsub

Here is the API:

```protobuf
service Broker {
  rpc Publish(PublishMessages) returns (Empty) {}
  rpc Subscribe(Subscription) returns (stream ReceivedMessage) {}
}
```

## Installation

```bash
git clone git@github.com:inre/pubsub.git pubsub && cd pubsub
npm i
```
## Quick Start

### Broker

Start/stop the broker:

```bash
npm start
npm stop
```
Start in debug:

```bash
npm run dev
```

### Subscribe

Subcribe to topics:

```bash
npm run sub topic1 topic2 topic3
```

### Publish

Publish to topic:

```bash
npm run pub topic1 "payload"
```

### Tests

```bash
npm stop
gem install cucumber
gem install thread
npm test
```
