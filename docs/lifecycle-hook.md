# lifecycle Hook

## Route

* __onRoute__:Triggered when the service is registered, and the service information is registered to NATS after the end.

>
### Usage
```javascript

beanify.addHook('onRoute',({context,log},next)=>{
    next()
})

```



## Inject

* __onBeforeInject__:Triggered first when the service is invoked, can be used to add __options__ information to the __context__
* __onInject__:Triggered when building a NATS payload, which can be used to add information to __natsRequest__
* __onAfterInject__:Triggered at the end of the service call, can be used to intercept __error__, __replys__

>
### Usage
```javascript

beanify.addHook('onBeforeInject',({context,options:injectOptions,log},next)=>{
    next()
})

beanify.addHook('onInject',({context,natsRequest,log},next)=>{
    next()
})

beanify.addHook('onAfterInject',({context,error,replys,log},next)=>{
    next()
})

```


## Request

* __onRequest__:Triggered when a NATS payload is received, which can be used to intercept NATS payload and ReplyTo subject
* __onBeforeHandler__:Triggered when the __context__ is created, can be used to add __natsRequest__ data to the __context__.
* __onHandler__:Triggered before calling the service handler, can be used to add __context__ data to __req__
* __onAfterHandler__:Triggered after the service processing ends, can be used to intercept __context__, __req__, __res__
* __onResponse__:Triggered when returning data, can be used to add __context__ data to __natsResponse__

>
### Usage
```javascript

beanify.addHook('onRequest',({natsRequest,natsReply,log},next)=>{
    next()
})

beanify.addHook('onBeforeHandler',({context,natsRequest,log},next)=>{
    next()
})

beanify.addHook('onHandler',({context,req,log},next)=>{
    next()
})

beanify.addHook('onAfterHandler',({context,req,res,log},next)=>{
    next()
})

beanify.addHook('onResponse',({context,natsResponse,log},next)=>{
    next()
})

```

## Error

* __onError__:Fires when [Route Hook](#Route), [Inject Hook](#Inject), [Request Hook](#Request) error or throws an exception

## Close

* __onClose__:Triggered by the [AVVIO](https://github.com/mcollina/avvio) framework