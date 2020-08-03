# Request and Reply

NATS supports two flavors of request reply messaging: point-to-point or one-to-many. Point-to-point involves the fastest or first to respond. In a one-to-many exchange, you set a limit on the number of responses the requestor may receive. In a request-response exchange, publish request operation publishes a message with a reply subject expecting a response on that reply subject. You can request to automatically wait for a response inline. The request creates an INBOX-channel and performs a request call with the inbox reply and returns the first reply received. This is optimized in the case of multiple responses.

## Request (point-to-point)
Beanify using queue groups by default. All subscribers with the same queue name form the queue group. In Beanify a group name is the name of the topic. As messages on the registered subject are published, one member of the group is chosen randomly to receive the message. Although queue groups have multiple subscribers, each message is only consumed by only one. This allows us to load-balancing the traffic by NATS.

NATS Queueing
This is the default method to start a request. The INBOX-channel is automatically closed after the response.

```javascript

beanify.inject({
    url:'math.add',
    body:{
        a: 1,
        b: 1
    }
  },
  function(err, resp) {}
)

```

