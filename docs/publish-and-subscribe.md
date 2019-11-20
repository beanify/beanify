# Publish and Subscribe
NATS implements a publish subscribe message distribution model. NATS publish subscribe is a one-to-many communication. A publisher sends a message on a subject. Any active subscriber listening on that subject receives the message. Subscribers can register interest in wildcard subjects. In an asynchronous exchange, messages are delivered to the subscriber’s message handler. If there is no handler, the subscription is synchronous and the client may be blocked until it can process the message.

## Normal (one-to-many)
You can send a message with publish and subscribe semantic with the $pubsub property.

```javascript

beanify.route({
    $pubsub: true,
    url:'math.add'
  },
  function(req) {}
)

//Publish
beanify.inject({
  $pubsub: true,
  url:'math.add'
})
```

## Special - one-to-one
We are able to publish messages without to create an INBOX in NATS. We can publish messages to the specific queue group math so only one subscriber will proceed the message. This has big performance benefits in comparison with the request-reply model.

```javascript
//Subscribe
beanify.route({
    url:'math.add'
  },
  function(req) {}
)

//Publish
beanify.inject({
  $pubsub: true,
  url:'math.add'
})
```