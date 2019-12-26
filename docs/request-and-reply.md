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

## Multiple return

```javascript
beanify.route({
    url:'math.add'
  },
  function({body},res) {
    const res1=1;
    const res2=2;
    res(null,res1,res2)
  }
)

beanify.inject({
    url:'math.add',
    body:{
        a: 1,
        b: 1,
    },
  },
  function(err, res1,res2) {
    //res1==1;res2==2
  }
)
```

## Receive multiple messages
This allows you to receive multiple messages (in this case 10). If you don't receive 10 messages the INBOX channel is still open and you have to close it manually.

```javascript
beanify.route({
    url:'math.add'
  },
  function({body}) {
    this.write(body.a + body.b)
  }
)

beanify.inject({
    url:'math.add',
    body:{
        a: 1,
        b: 1,
    },
    $max: 10
  },
  function(err, resp) {
    // You can receive 10 messages but also need 10 responses

    this.close()
  }
)
```

## Receive at least N messages
This ensures that you have to receive at least N responses (in this case 5) within the timeout (default 2000) before a timeout error is thrown and the INBOX-channel is unsubscribed. You can't receive more than expected messages the INBOX-channel is closed automatically.

```javascript
beanify.route({
    url:'math.add'
  },
  function({body}) {
    this.write(body.a + body.b)
  }
)

beanify.inject({
    url:'math.add',
    body:{
        a: 1,
        b: 1,
    },
    $expected: 5
  },
  function(err, resp) {
    // You have to receive 5 responses
  }
)

```

## Receive unknown count of messages
This allows you to receive an unknown count of messages but be aware that you are responsible to close the INBOX-channel.

```javascript
beanify.route({
    url:'math.add'
  },
  function({body}) {
    this.write(body.a + body.b)
  }
)

beanify.inject(
  {
    url:'math.add',
    body:{
      a: 1,
      b: 1,
    },
    $max: -1
  },
  function(err, resp) {
    // close it anytime
    this.close()
  }
)

```